import Emitter           from './emitter'
import MetaDomain        from './domains/meta'
import History           from './history'
import Domain            from './domain'
import lifecycle         from './lifecycle'
import getDomainHandlers from './getDomainHandlers'
import merge             from './merge'
import shallowEqual      from './shallow-equal'
import update            from './update'

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
  constructor ({ maxHistory = -Infinity, pure = true } = {}) {
    super()

    this.maxHistory = maxHistory
    this.pure = pure

    this.history = new History()
    this.domains = []

    // cache domain registry methods for efficiency
    this.registry = {}

    /**
     * State is captured in three phases. Each stage solves a different problem:
     *
     * 1. archive  A cache of completed actions. Since actions will never change,
     *             writing them to an archive allows the actions to be disposed,
     *             improving dispatch efficiency.
     * 2. staged   The "private" state, before writing for public consumption.
     *             Domain may not operate on primitive (like ImmutableJS), this
     *             allows a domain to work with complex data types while still
     *             exposing a primitive public state
     * 3. state    Public state. The `willCommit` lifecycle method allows a
     *             domain to transform private state before it changes. This
     *             is useful for turning something like Immutable.Map() or
     *             a linked-list into a primitive object or array.
     */
    this.archive = {}
    this.staged = {}
    this.state = {}

    // Standard domain reduction behaviors
    this.addDomain(MetaDomain)

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
   * Generates the starting state for a Microcosm instance by asking every
   * domain that subscribes to `getInitialState`.
   *
   * @return {Object} State object representing the initial state.
   */
  getInitialState () {
    return this.dispatch({}, { type: lifecycle.willStart })
  }

  /**
   * Microcosm maintains an archive of "merged" actions. When an action completes,
   * it checks the maxHistory property to decide if it should prune the action
   * and dispatch it into the archive.
   *
   * @private
   * @param {Action} action target action to "clean"
   * @param {Number} size the depth of the history
   * @return {Boolean} Was the action merged into the archive?
   */
  clean (action, size) {
    const shouldMerge = size > this.maxHistory && action.is('disposable')

    if (shouldMerge) {
      this.archive = this.dispatch(this.archive, action)
    }

    return shouldMerge
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
    if (!this.registry[type]) {
      this.registry[type] = getDomainHandlers(this.domains, type)
    }

    const handlers = this.registry[type]

    for (var i = 0, len = handlers.length; i < len; i++) {
      const { key, domain, handler } = handlers[i]

      const last = update.get(state, key)
      const next = handler.call(domain, last, payload)

      state = update.set(state, key, domain.stage(last, next))
    }

    return state
  }

  /**
   * Run through the action history, dispatching their associated
   * types and payloads to domains for processing. Emits "change".
   *
   * @private
   * @return {Microcosm} self
   */
  rollforward () {
    this.history.prune(this.clean, this)

    const staged = this.history.reduce(this.dispatch, this.archive, this)

    const next = this.domains.reduce((memo, domain) => {
      return this.commit(memo, domain[0], domain[1])
    }, staged)

    this.staged = staged

    if (!this.pure || shallowEqual(this.state, next) === false) {
      this.state = next
      this._emit('change', next)
    }

    return this
  }

  /**
   * Identify the last and next staged state, then ask the associated domain
   * if it should commit it. If so, roll state forward.
   * @private
   */
  commit (staged, key, domain) {
    const last  = update.get(this.staged, key)
    const next  = update.get(staged, key)
    const value = domain.shouldCommit(last, next) ? domain.commit(next) : update.get(this.state, key)

    return update.set(staged, key, value)
  }

  /**
   * Append an action to history and return it. This is used by push,
   * but also useful for testing action states
   *
   * @param {Function} behavior - An action function
   * @return {Action} action representation of the invoked function
   */
  append (behavior) {
    const action = this.history.append(behavior)

    action.on('change', this.rollforward, this)

    return action
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
    const action = this.append(behavior)

    action.execute(...params)

    return action
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
  addDomain (key, config) {
    if (arguments.length < 2) {
      // Important! Assignment this way is important
      // to support IE9, which has an odd way of referencing
      // arguments
      config = key
      key = null
    }

    let domain = null

    if (typeof config === 'function') {
      domain = new config()
    } else {
      domain = merge(new Domain(), config)
    }

    this.domains = this.domains.concat([[ key, domain ]])

    domain.setup()

    this.rebase()

    return this
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
    return this.reset(merge({}, this.staged, this.deserialize(data)))
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
    this.registry = {}

    this.archive = merge(this.getInitialState(), this.archive)

    // This ensures there is always a last state for "shouldCommit"
    this.staged = merge({}, this.archive, this.staged)

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

    this.rollforward()

    return this
  }

}
