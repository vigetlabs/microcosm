import Emitter   from 'component-emitter'
import MetaStore from './stores/meta'
import Store     from './store'
import Tree      from './tree'
import lifecycle from './lifecycle'

/**
 * The Microcosm class. You can extend this class with additional methods,
 * or perform setup within the constructor of a subclass.
 *
 * Options:
 *
 * - `maxHistory`. Microcosm maintains a tree of all actions. This is
 *    how deep that tree should be allowed to grow. Defaults to none
 *    (-Infinity).
 *
 * @example
 *     let app = new Microcosm()
 *     let app = new Microcosm({ maxHistory: 10 })
 *
 * @param {{maxHistory: Number}} options - Instantiation options.
 * @api public
 */
function Microcosm ({ maxHistory = -Infinity } = {}) {
  this.maxHistory = maxHistory

  this.cache    = {}
  this.state    = {}
  this.stores   = []
  this.history  = new Tree()

  // Standard store reduction behaviors
  this.addStore(MetaStore)
}

Microcosm.prototype = {
  constructor: Microcosm,

  /**
   * Determines the initial state of the Microcosm instance by
   * dispatching the `willStart` lifecycle action. This is pure,
   * calling getInitialState does not produce side-effects.
   *
   * @return {Object} State object representing the initial state.
   */
  getInitialState() {
    return this.dispatch({}, { type: lifecycle.willStart, payload: this.state })
  },

  /**
   * Microcosms maintain a cache of "merged" actions. Actions that are
   * done, that will never change again. This decision is based upon
   * the `maxHistory` option provided to a Microcosm instance. This is
   * internal plumbing, you shouldn't have to invoke this method.
   *
   * @api private
   *
   * @param {Action} action target action to "clean"
   *
   * @return {Boolean} Was the action merged into the state cache?
   */
  clean(action) {
    if (action.is('disposable') && this.history.size() > this.maxHistory) {
      this.cache = this.dispatch(this.cache, action)
      return true
    }

    return false
  },

  /**
   * When an action emits a change, Microcosm uses this method to run
   * through the action history, dispatching their associated types
   * and payloads to stores for processing.
   *
   * This will produce a "change" event.
   *
   * @api private
   *
   * @return {Microcosm} self
   */
  rollforward() {
    this.history.prune(this.clean, this)

    this.state = this.history.reduce(this.dispatch, this.cache, this)

    this.emit('change', this.state)

    return this
  },

  /**
   * Given a state, sends an action to all stores for processing. This is pure,
   * assuming stores do not produce side-effects. The results of this function
   * are used by `rollforward()` to determine state changes.
   *
   * @api private
   *
   * @return {Object} state - A new state object
   */
  dispatch(state, { type, payload }) {
    return this.stores.reduce((next, [key, store]) => store.receive(next, type, payload, key), state)
  },


  /**
   * Push an action into Microcosm. This will trigger the lifecycle for updating
   * state.
   *
   * @api public
   *
   * @param {Function} type - An action function
   * @param {...Array} params - Parameters to invoke the type with
   *
   * @return {Action} action representation of the invoked function
   */
  push(type, ...params) {
    let action = this.history.append(type)

    action.on('change', this.rollforward.bind(this))
    action.execute(...params)

    return action
  },

  /**
   * Adds a store to the Microcosm instance. A store informs the
   * microcosm how to process various action types. If no key
   * is given, the store will operate on all application state.
   *
   * @example
   *     var app = new Microcosm()
   *
   *     app.addStore(planets, {
   *       getInitialState: () => [],
   *       add: (planets, planet) => planets.concat(planet)
   *     })
   *
   * @param {String} key - The namespace within application state for the store.
   * @param {Object|Function} config - Configuration options for the store
   *
   * @return {Microcosm} self
   */
  addStore(key, config) {
    if (arguments.length < 2) {
      // Important! Assignment this way is important
      // to support IE9, which has an odd way of referencing
      // arguments
      config  = key
      key = null
    }

    this.stores = this.stores.concat([[ key, new Store(config) ]])

    this.rebase()

    return this
  },

  /**
   * Push an action to reset the state of the instance. This state is folded
   * on to the result of `getInitialState()`.
   *
   * @param {Object} state - A new state object to apply to the instance
   *
   * @return {Action} action - An action representing the reset operation.
   */
  reset(state) {
    return this.push(lifecycle.willReset, Object.assign(this.getInitialState(), state))
  },

  /**
   * Deserialize a given state and reset the instance with that
   * processed state object.
   *
   * @param {Object} state - A raw state object to deserialize and apply to the instance
   *
   * @return {Action} action - An action representing the replace operation.
   */
  replace(data) {
    return this.reset(this.deserialize(data))
  },

  /**
   * Deserialize a given payload by asking every store how to it
   * should process it (via the deserialize store function).
   *
   * @param {Object} payload - A raw object to deserialize into a valid application state

   * @return {Object} The deserialized version of the provided payload.
   */
  deserialize(payload) {
    if (payload != null) {
      return this.dispatch(payload, { type: lifecycle.willDeserialize, payload })
    }
  },

  /**
   * Serialize application state by asking every store how to serialize the state
   * they manage (via the serialize store function).
   *
   * @example
   *     app.toJSON() // => { planets: [...] }
   *     JSON.stringify(app) // => '{ "planets": [...] }'
   *
   * @return {Object} The serialized version of application state.
   */
  toJSON() {
    return this.dispatch(this.state, { type: lifecycle.willSerialize, payload: this.state })
  },

  /**
   * Recalculate initial state by back-filling the cache object with the result
   * of getInitialState(). This is used when a store is added to Microcosm to ensure
   * the initial state of the store is respected.
   *
   * This will produce a "change" event.
   *
   * @api private
   * @returns {Microcosm} self
   */
  rebase() {
    this.cache = Object.assign(this.getInitialState(), this.cache)
    return this.rollforward()
  }

}

Emitter(Microcosm.prototype)

export default Microcosm
