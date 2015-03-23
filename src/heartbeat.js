/**
 * Heartbeat
 * Based on Diode, emits a heartbeat whenever any store state has changed.
 * When Stores change, they can use this entity to broadcast
 * that state has changed.
 *
 * See https://github.com/vigetlabs/diode
 */

export default class Heartbeat {

  constructor() {
    this._callbacks = []
  }

  /**
   * Given a CALLBACK function, remove it from the Set of callbacks.
   * Throws an error if the callback is not included in the Set.
   */
  ignore(callback) {
    this._callbacks = this._callbacks.filter(i => i !== callback)
  }

  /**
   * Given a CALLBACK function, add it to the Set of all callbacks.
   */
  listen(callback) {
    this._callbacks = this._callbacks.concat(callback)
  }

  /**
   * Trigger every callback in the Set
   */
  pump() {
    /**
     * Important: do not cache the length of _callbacks
     * in the event a callback causes later subscriptions
     * to disappear
     */
    for (var i = 0; i < this._callbacks.length; i++) {
      this._callbacks[i]()
    }
  }

}
