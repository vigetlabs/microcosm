/**
 * Pulse
 * A singular event emitter. Pulse is simply the result of pumping
 * blood.
 *
 * This is a factory/decorator depending on usage. There are some
 * compression benefits to this, prevents the need to use super.
 */

function pulse (infuse={}) {
  let callbacks = []

  /**
   * Given a CALLBACK function, remove it from the Set of callbacks.
   * Throws an error if the callback is not included in the Set.
   */
  infuse.ignore = function (callback) {
    callbacks = callbacks.filter(i => i !== callback)
  }

  /**
   * Given a CALLBACK function, add it to the Set of all callbacks.
   */
  infuse.listen = function (callback) {
    callbacks.push(callback)
  }

  /**
   * Trigger every callback in the Set
   */
  infuse.pump = function () {
    /**
     * Important: do not cache the length of _callbacks
     * in the event a callback causes later subscriptions
     * to disappear
     */
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i].call(this)
    }
  }

  return infuse
}

export default pulse
