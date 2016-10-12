import Emitter      from './emitter'
import History      from './history'
import MetaDomain   from './domains/meta'
import Realm        from './realm'
import lifecycle    from './lifecycle'
import merge        from './merge'
import shallowEqual from './shallow-equal'
import update       from './update'

/**
 * A tree-like data structure that keeps track of the execution order
 * of actions that are pushed into it, sequentially folding them
 * together to produce an object that can be rendered by a
 * presentation library (such as React).
 *
 * @extends {Emitter}
 */
export default class Microcosm extends Emitter {

  /**
   * @param {{maxHistory: Number}} options - Instantiation options.
   */
  constructor ({ maxHistory, pure=true, history, parent } = {}) {
    super()

    this.history = history || new History(maxHistory)
    this.realm = new Realm()

    this.pure = pure
    this.parent = parent

    this.listenTo(this.history, 'archive', this.archive)
    this.listenTo(this.history, 'reconcile', this.reconcile)
    this.listenTo(this.history, 'release', this.release)

    this.archived = {}
    this.staged = {}
    this.head = {}

    this.state = {}

    // Only the root gets the meta domain
    if (this.parent) {
      this.rollforward()
    } else {
      this.addDomain(MetaDomain)
    }

    // Microcosm is now ready. Call the setup lifecycle method
    this.setup()
  }

  /**
   * Called whenever a Microcosm is instantiated. This provides a
   * more intentional preparation phase that does not require
   * tapping into the constructor
   */
  setup () {
    // NOOP
  }

  /**
   * Remove all subscriptions
   */
  teardown() {
    // Remove all listeners
    this.off()

    // Remove all observers on history
    this.stopListening()
  }

  /**
   * Generates the starting state for a Microcosm instance by asking every
   * domain that subscribes to `getInitialState`.
   *
   * @return {Object} State object representing the initial state.
   */
  getInitialState () {
    return this.dispatch({}, { type: lifecycle.willStart })
  }

  /**
   * Similarly to a domain (maybe we can reconcile these), get all handlers
   * registered for a type
   * @private
   */
  register (type) {
    return this.realm.register(type)
  }

  /**
   * Dispatch an action to a list of domains. This is used by state
   * management methods, like `rollforward` and `getInitialState` to
   * compute state. Assuming there are no side-effects in domain
   * handlers, this is pure. Calling this method will not update
   * repo state.
   *
   * @private
   * @param {Object} state - The starting state of a Microcosm
   * @param {Action} action - The action do dispatch
   * @return {Object} The new state
   */
  dispatch (state, { type, payload }) {
    let handlers = this.register(type)

    for (var i = 0, len = handlers.length; i < len; i++) {
      const { key, domain, handler } = handlers[i]

      const last = update.get(state, key)
      const next = handler.call(domain, last, payload)

      state = update.set(state, key, domain.stage(last, next))
    }

    return state
  }

  /**
   * Cache an action, then emit an archive event for any forks
   * @param {Action} action - Action to archive
   * @return {Microcosm} self
   */
  archive (action) {
    this.archived = this.dispatch(this.archived, action)

    return this
  }

  /**
   * Given an archive, get the next staged state.
   * @return {Object} staged state
   */
  stage () {
    return this.history.reduce(this.dispatch, merge({}, this.archived), this)
  }

  /**
   * Identify the last and next staged state, then ask the associated domain
   * if it should commit it. If so, roll state forward.
   * @private
   */
  commit (staged) {
    return this.realm.reduce(this.write, merge({}, staged), this)
  }

  /**
   * How microcosm actually writes to state
   */
  write (state, key, domain) {
    const last = update.get(this.staged, key)
    const next = update.get(state, key)

    if (domain.shouldCommit(last, next)) {
      return update.set(state, key, domain.commit(next))
    }

    return update.set(state, key, update.get(this.head, key))
  }

  /**
   * Run through the action history, dispatching their associated
   * types and payloads to domains for processing. Emits "change".
   *
   * @private
   * @return {Microcosm} self
   */
  reconcile () {
    let next = this.stage()

    this.head   = merge({}, this.parent ? this.parent.head : null, this.commit(next))
    this.staged = next

    return this
  }

  release () {
    if (this.pure && shallowEqual(this.head, this.state)) {
      return false
    }

    this.state = this.head

    this._emit('change', this.state)
  }

  rollforward() {
    this.reconcile()
    this.release()
  }

  /**
   * Append an action to history and return it. This is used by push,
   * but also useful for testing action states
   *
   * @param {Function} behavior - An action function
   * @return {Action} action representation of the invoked function
   */
  append (behavior) {
    return this.history.append(behavior)
  }

  /**
   * Push an action into Microcosm. This will trigger the lifecycle for updating
   * state.
   *
   * @param {Function} behavior - An action function
   * @param {...Array} params - Parameters to invoke the type with
   * @return {Action} action representation of the invoked function
   */
  push (behavior, ...params) {
    return this.append(behavior).execute(params)
  }

  /**
   * Partially apply push
   *
   * @param {...Array} params - Parameters to invoke the type with
   * @return {Function} A partially applied push function
   */
  prepare (...params) {
    return this.push.bind(this, ...params)
  }

  /**
   * Adds a domain to the Microcosm instance. A domain informs the
   * microcosm how to process various action types. If no key
   * is given, the domain will operate on all application state.
   *
   * @param {String} key - The namespace within application state for the domain.
   * @param {Object|Function} config - Configuration options for the domain
   * @return {Microcosm} self
   */
  addDomain () {
    this.realm.add.apply(this.realm, arguments)

    return this.rebase()
  }

  addStore() {
    console.warn('repo.addStore has been deprecated. Please use repo.addDomain')
    return this.addDomain.apply(this, arguments)
  }

  /**
   * Push an action to reset the state of the instance. This state is folded
   * on to the result of `getInitialState()`.
   *
   * @param {Object} state - A new state object to apply to the instance
   * @return {Action} action - An action representing the reset operation.
   */
  reset (state) {
    return this.push(lifecycle.willReset, merge(this.getInitialState(), state))
  }

  /**
   * Deserialize a given state and reset the instance with that
   * processed state object.
   *
   * @param {Object} data - A raw state object to deserialize and apply to the instance
   * @return {Action} action - An action representing the replace operation.
   */
  replace (data) {
    return this.push(lifecycle.willReplace, this.deserialize(data))
  }

  /**
   * Deserialize a given payload by asking every domain how to it
   * should process it (via the deserialize domain function).
   *
   * @param {Object} payload - A raw object to deserialize.
   * @return {Object} The deserialized version of the provided payload.
   */
  deserialize (payload) {
    if (payload == null) {
      return {}
    }

    return this.dispatch(payload, { type: lifecycle.willDeserialize, payload })
  }

  /**
   * Serialize application state by asking every domain how to
   * serialize the state they manage (via the serialize domain
   * function).
   *
   * @return {Object} The serialized version of repo state.
   */
  serialize () {
    return this.dispatch(this.staged, { type: lifecycle.willSerialize })
  }

  /**
   * Alias serialize for JS interoperability.
   * @return {Object} result of `serialize`.
   */
  toJSON () {
    return this.serialize()
  }

  /**
   * Recalculate initial state by back-filling the cache object with
   * the result of getInitialState(). This is used when a domain is
   * added to Microcosm to ensure the initial state of the domain is
   * respected. Emits a "change" event.
   *
   * @private
   * @return {Microcosm} self
   */
  rebase () {
    this.archived = merge(this.getInitialState(), this.archived)

    // Always ensure there is a last "staged" state
    this.staged = merge({}, this.archived, this.staged)

    this.rollforward()

    return this
  }

  /**
   * Change the focus of the history tree. This allows for features
   * like undo and redo.
   *
   * @param {Action} action to checkout
   * @return {Microcosm} self
   */
  checkout (action) {
    this.history.checkout(action)

    return this
  }

  /**
   * Create a copy of this Microcosm, passing in the same history and
   * a reference to itself. As actions are pushed into the shared history,
   * each Microcosm will resolve differently.
   */
  fork () {
    return new Microcosm({
      parent  : this,
      pure    : this.pure,
      history : this.history
    })
  }

}
