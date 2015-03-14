/**
 * Heartbeat
 * Based on Diode, emits a heartbeat whenever any store state has changed.
 * When Stores change, they can use this entity to broadcast
 * that state has changed.
 *
 * See https://github.com/vigetlabs/diode
 */

export default function() {
  var _callbacks = []
  var _tick      = null

  /**
   * Callbacks are eventually executed, Heartbeat does not promise
   * immediate consistency so that state propagation can be batched
   */
  var _pump = function() {
    /**
     * Important: do not cache the length of _callbacks
     * in the event a callback causes later subscriptions
     * to disappear
     */
    for (var i = 0; i < _callbacks.length; i++) {
      _callbacks[i]()
    }
  }

  return {

    /**
     * Given a CALLBACK function, remove it from the Set of callbacks.
     * Throws an error if the callback is not included in the Set.
     */
    ignore(callback) {
      _callbacks = _callbacks.filter(i => i !== callback)
    },

    /**
     * Given a CALLBACK function, add it to the Set of all callbacks.
     */
    listen(callback) {
      _callbacks = _callbacks.concat(callback)
    },

    /**
     * Trigger every callback in the Set
     */
    beat() {
      if (_callbacks.length > 0) {
        cancelAnimationFrame(_tick)
        _tick = requestAnimationFrame(_pump)
      }
    }

  }

}
