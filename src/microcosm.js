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
n * presentation library (such as React).
 *
 * @extends {Emitter}
 */
export default class Microcosm extends Emitter {

  /**
   * @param {{maxHistory: Number}} options - Instantiation options.
   */
  constructor ({ maxHistory, pure=true, history, parent=null } = {}) {
    super()

    this.history = history || new History(maxHistory)
    this.realm = new Realm()

    this.pure = pure
    this.parent = parent

    this.history.addRepo(this)

    // Long term storage. Keeps track of the root of the history tree
    this.archived = parent ? parent.archived : {}

    // Temporary storage. Keeps track of the focal point of the
    // history tree
    this.cached = parent ? parent.cached : {}

    // Staging. Domains can maintain their own internal representation of
    // data. Staged keeps track of this so Domains can control what gets
    // written to the head.
    // Important: Children only ever get the head state of their parents.
    this.staged = parent ? parent.head : {}

    // Head state. Keeps track of the head of the tree
    this.head = parent ? parent.head : {}

    // Publically available data. This gets updated whenever the head state
    // is shallowly different (or always, if impure).
    this.state = parent ? parent.state : {}

    // Only the root gets the meta domain
    if (!parent) {
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
    // Teardown all domains
    this.realm.teardown()

    // Remove all listeners
    this.off()

    // Remove this repo from history
    this.history.removeRepo(this)
  }

  /**
   * Generates the starting state for a Microcosm instance by asking every
   * domain that subscribes to `getInitialState`.
   *
   * @return {Object} State object representing the initial state.
   */
  getInitialState () {
    return this.dispatch({}, { type: lifecycle.getInitialState, payload: null })
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
   * Update the archive, this is called when the history tree
   * permanently removes a node.
   */
  archive (action) {
    this.archived = this.dispatch(this.archived, action)
  }

  /**
   * Update the cache point, this is called when the history tree
   * moves forward the current cache point.
   */
  cache (action) {
    this.cached = this.dispatch(this.cached, action)
  }

  /**
   * Rollback to the lastest cache, cloning it while we're outside of
   * the rollforward loop.
   *
   * @param {Action} action - Action to archive
   */
  rollback () {
    this.staged = merge({}, this.cached)
  }

  /**
   * Given an archive, get the next staged state.
   * @return {Object} staged state
   */
  stage (action) {
    // If a parent, we need to update the child with their parent's
    // latest head state
    if (this.parent !== null) {
      merge(this.staged, this.parent.head)
    }

    this.staged = action != null ? this.dispatch(this.staged, action) : this.staged
  }

  /**
   * Identify the last and next staged state, then ask the associated domain
   * if it should commit it. If so, roll state forward.
   * @private
   */
  commit () {
    this.head = this.realm.reduce(this.write, merge({}, this.staged), this)
  }

  /**
   * Write state to the head
   */
  write (state, key, domain) {
    const last = update.get(this.cached, key)
    const next = update.get(state, key)

    if (domain.shouldCommit(last, next)) {
      return update.set(state, key, domain.commit(next))
    }

    return update.set(state, key, update.get(this.state, key))
  }

  /**
   * Run through the action history, dispatching their associated
   * types and payloads to domains for processing. Emits "change".
   *
   * @private
   * @return {Microcosm} self
   */
  reconcile (action) {
    this.stage(action)

    this.commit()

    return this
  }

  release () {
    if (this.pure && shallowEqual(this.head, this.state)) {
      return this
    }

    this.state = this.head

    this._emit('change', this.state)

    return this
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

  addStore () {
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
    return this.push(lifecycle._willReset, merge(this.getInitialState(), state))
  }

  /**
   * Deserialize a given state and reset the instance with that
   * processed state object.
   *
   * @param {Object} data - A raw state object to deserialize and apply to the instance
   * @return {Action} action - An action representing the patch operation.
   */
  patch (data) {
    return this.push(lifecycle._willPatch, data)
  }

  replace (state) {
    console.warn('repo.replace has been deprecated. Please use repo.patch.')
    return this.patch(this.deserialize(state))
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

    return this.dispatch(payload, { type: lifecycle.deserialize, payload })
  }

  /**
   * Serialize application state by asking every domain how to
   * serialize the state they manage (via the serialize domain
   * function).
   *
   * @return {Object} The serialized version of repo state.
   */
  serialize () {
    return this.dispatch(this.staged, { type: lifecycle.serialize, payload: null })
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
    this.cached = merge(this.getInitialState(), this.cached)

    this.rollback()
    this.reconcile()
    this.release()

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
    this.cached = merge({}, this.archived)

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
