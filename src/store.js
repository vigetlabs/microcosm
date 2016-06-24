import { get, set } from './update'

/**
 * Stores are responsible for determing how a microcosm should respond
 * to actions. Whenever they `receive` an action, a store will use its
 * `register` method to determine if it should update state.
 *
 * This class should not be instantiated directly. Instead, use
 * `microcosm.addStore()`.
 *
 * @api private
 *
 * @param {Object|Function} options a register function or object of handlers
 */
export default class Store {

  constructor(options) {
    if (typeof options === 'function') {
      options = { register: options }
    }

    Object.assign(this, options)
  }

  /**
   * The public API for stores is `register`, however `receive`
   * provides an escape hatch for more flexibility in how a store
   * responds to actions. You can override this method when
   *
   * @api public
   *
   * @param {Object} state The current state of a Microcosm.
   * @param {Function|String} type The type of the associated action.
   * @param {Any} payload - The body of the action.
   * @param {String} key - The key path this store is mounted to.
   *
   * @returns {Object} A new state
   */
  receive(state, type, payload, key) {
    const handler = this[type] || this.register()[type]

    if (handler == undefined) {
      return state
    }

    return set(state, key, handler.call(this, get(state, key), payload))
  }

  /**
   * Used to map store handlers to action types. This is how change
   * happens.
   *
   * This function should be overriden, either by passing
   * a function into a new Store, or providing a configuration object
   * that includes a register method.
   *
   * @example
   *     microcosm.addStore('key', function() {
   *         return { [action]: handler }
   *     })
   *
   *     microcosm.addStore('key', {
   *         register() {
   *             return { [action]: handler }
   *         }
   *     })
   *
   * @api public
   *
   * @returns {Object} A new state
   */
  register() {
    return {}
  }

}
