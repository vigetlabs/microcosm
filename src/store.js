const EMPTY = {}

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
export default function Store (options) {
  if (typeof options === 'function') {
    options = { register: options }
  }

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }
}

Store.prototype = {

  constructor: Store,

  /**
   * The public API for stores is `register`, however `receive`
   * provides an escape hatch for more flexibility in how a store
   * responds to actions.
   *
   * @api public
   *
   * @param {Object} previous The previous state
   * @param {Function|String} type The type of the associated action.
   * @param {Any} payload - The body of the action.
   *
   * @returns {Object} A new state
   */
  receive(previous, { type, payload }) {
    const handler = this[type] || this.register()[type]

    if (handler == undefined) {
      return previous
    }

    return handler.call(this, previous, payload)
  },

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
    return EMPTY
  }

}
