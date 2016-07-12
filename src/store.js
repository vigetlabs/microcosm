import merge from './merge'

const EMPTY = {}

/**
 * Stores are responsible for determining how a microcosm should respond
 * to actions. Whenever they `receive` an action, a store will use its
 * `register` method to determine if it should update state.
 *
 * This class should not be instantiated directly. Instead, use
 * `microcosm.addStore()`.
 *
 * @param {Object|Function} options a register function or object of handlers
 * @private
 */
export default class Store {

  constructor (config) {
    const options = typeof config === 'function' ? { register: config } : config

    merge(this, options)
  }

  /**
   * The public API for stores is `register`, however `receive`
   * provides an escape hatch for more flexibility in how a store
   * responds to actions.
   *
   *
   * @param {Object} previous The previous state
   * @param {{ type: String, payload: Any }} action - An action
   * @return {Object} A new state
   * @public
   */
  receive(previous, { type, payload }) {
    if (this[type]) {
      return this[type].call(this, previous, payload)
    }

    const registry = this.register()
    const handler  = registry[type]

    if ('undefined' in registry) {
      throw new Error("This store's registry contains a 'undefined' key. Check the register method for this store.")
    }

    return handler == undefined ? previous : handler.call(this, previous, payload)
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
   * @return {Object} A new state
   * @public
   */
  register() {
    return EMPTY
  }

}
