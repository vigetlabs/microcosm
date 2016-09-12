import Emitter          from './emitter'
import MetaStore        from './stores/meta'
import Tree             from './tree'
import Store            from './store'
import lifecycle        from './lifecycle'
import getStoreHandlers from './getStoreHandlers'
import merge            from './merge'
import shallowEqual     from './shallow-equal'
import update           from './update'

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

    this.history = new Tree()
    this.pure = pure
    this.maxHistory = maxHistory
    this.stores = []

    // cache store registry methods for efficiency
    this.registry = {}

    /**
     * State is captured in three phases. Each stage solves a different problem:
     *
     * 1. archive  A cache of completed actions. Since actions will never change,
     *             writing them to an archive allows the actions to be disposed,
     *             improving dispatch efficiency.
     * 2. staged   The "private" state, before writing for public consumption.
     *             Store may not operate on primitive (like ImmutableJS), this
     *             allows a store to work with complex data types while still
     *             exposing a primitive public state
     * 3. state    Public state. The `willCommit` lifecycle method allows a
     *             store to transform private state before it changes. This
     *             is useful for turning something like Immutable.Map() or
     *             a linked-list into a primitive object or array.
     */
    this.archive = {}
    this.staged = {}
    this.state = {}

    // Standard store reduction behaviors
    this.addStore(MetaStore)

    // Microcosm is now ready. Call the setup lifecycle method
    this.setup()
  }

  /**
   * Called whenever a Microcosm is instantiated. This provides a
   * more intentional preparation phase that does not require
   * tapping into the constructor
   */
  setup() {
    // NOOP
  }

  /**
   * Generates the starting state for a Microcosm instance by asking every
   * store store that subscribes to `getInitialState`.
   *
   * @return {Object} State object representing the initial state.
   */
  getInitialState () {
    return this.dispatch({}, { type: lifecycle.willStart, payload: this.state })
  }

  /**
   * Microcosm maintains an archive of "merged" actions. When an action completes,
   * it checks the maxHistory property to decide if it should prune the action
   * and dispatch it into the archive.
   *
   * @private
   * @param {Action} action target action to "clean"
   * @param {Number} size the depth of the tree
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
   * Dispatch an action to a list of stores. This is used by state
   * management methods, like `rollforward` and `getInitialState` to
   * compute state. Assuming there are no side-effects in store
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
      this.registry[type] = getStoreHandlers(this.stores, type)
    }

    const handlers = this.registry[type]

    for (var i = 0, len = handlers.length; i < len; i++) {
      const { key, store, handler } = handlers[i]

      const last = update.get(state, key)
      const next = handler.call(store, last, payload)

      state = update.set(state, key, store.stage(last, next))
    }

    return state
  }

  /**
   * Run through the action history, dispatching their associated
   * types and payloads to stores for processing. Emits "change".
   *
   * @private
   * @return {Microcosm} self
   */
  rollforward () {
    this.history.prune(this.clean, this)

    const staged = this.history.reduce(this.dispatch, this.archive, this)

    const next = this.stores.reduce((memo, store) => {
      return this.commit(memo, store[0], store[1])
    }, merge({}, staged))

    this.staged = staged

    if (!this.pure || shallowEqual(this.state, next) === false) {
      this.state = next
      this._emit('change', next)
    }

    return this
  }

  /**
   * Identify the last and next staged state, then ask the associated store
   * if it should commit it. If so, roll state forward.
   * @private
   */
  commit(staged, key, store) {
    const last  = update.get(this.staged, key)
    const next  = update.get(staged, key)
    const value = store.shouldCommit(next, last) ? store.commit(next) : update.get(this.state, key)

    return update.set(staged, key, value)
  }

  /**
   * Append an action to a microcosm's history. In a production
   * repo, this is typically reserved for testing. `append`
   * will not execute an action, making it easier to test individual
   * action operations.
   *
   * @param {Function} behavior - An action function
   * @return {Action} action representation of the invoked function
   */
  append(behavior) {
    const action = this.history.append(behavior)

    action.on('change', () => this.rollforward())

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
    return this.append(behavior).execute(...params)
  }

  /**
   * Partially apply push
   *
   * @param {...Array} params - Parameters to invoke the type with
   * @return {Function} A partially applied push function
   */
  prepare(...params) {
    return this.push.bind(this, ...params)
  }

  /**
   * Adds a store to the Microcosm instance. A store informs the
   * microcosm how to process various action types. If no key
   * is given, the store will operate on all repo state.
   *
   * @param {String} key - The namespace within repo state for the store.
   * @param {Object|Function} config - Configuration options for the store
   * @return {Microcosm} self
   */
  addStore (key, config) {
    if (arguments.length < 2) {
      // Important! Assignment this way is important
      // to support IE9, which has an odd way of referencing
      // arguments
      config  = key
      key = null
    }

    let store = null

    if (typeof config === 'function') {
      store = new config()
    } else {
      store = merge(new Store(), config)
    }

    this.stores = this.stores.concat([[ key, store ]])

    // Setup is called once, whenever to store is added to the microcosm
    store.setup()

    this.rebase()

    return this
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
    return this.reset(this.deserialize(data))
  }

  /**
   * Deserialize a given payload by asking every store how to it
   * should process it (via the deserialize store function).
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
   * Serialize repo state by asking every store how to
   * serialize the state they manage (via the serialize store
   * function).
   *
   * @return {Object} The serialized version of repo state.
   */
  serialize() {
    return this.dispatch(this.state, { type: lifecycle.willSerialize, payload: this.state })
  }

  /**
   * Alias serialize for JS interoperability.
   * @return {Object} result of `serialize`.
   */
  toJSON() {
    return this.serialize()
  }

  /**
   * Recalculate initial state by back-filling the archive with the
   * result of getInitialState(). This is used when a store is added
   * to Microcosm to ensure the initial state of the store is respected
   * Emits a "change" event.
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
