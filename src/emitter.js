/**
 * An abstract event emitter class. Several modules extend from this class
 * to utilize events.
 * @constructor
 * @property {Object[]} _events A pool of event listeners
 */
export default function Emitter () {
  this._events = []
}

Emitter.prototype = {

  /**
   * Add an event listener.
   * @param {string} event Type of event
   * @param {Function} fn Event callback
   * @param {*} [scope] Optional scope to invoke callback with
   */
  on (event, fn, scope) {
    this._events.push({ event, fn, scope, once: false })

    return this
  },

  /**
   * Adds an `event` listener that will be invoked a single time then
   * automatically removed.
   * @param {string} event Type of event
   * @param {Function} fn Event callback
   * @param {*} [scope] Optional scope to invoke callback with
   */
  once (event, fn, scope) {
    this._events.push({ event, fn, scope, once: true })

    return this
  },

  /**
   * Unsubscribe a callback. If no event is provided, removes all callbacks. If
   * no callback is provided, removes all callbacks for the given type.
   * @param {string} event Type of event
   * @param {Function} fn Event callback
   * @param {*} [scope] Optional scope to invoke callback with
   */
  off (event, fn, scope) {
    var removeAll = fn == null

    let i = 0
    while (i < this._events.length) {
      var cb = this._events[i]

      if (cb.event === event) {
        if (removeAll || (cb.fn === fn && cb.scope === scope)) {
          this._events.splice(i, 1)
          continue
        }
      }

      i += 1
    }

    return this
  },

  /**
   * Purge all event listeners
   */
  removeAllListeners () {
    this._events.length = 0
  },

  /**
   * Emit `event` with the given args.
   * @param {string} event Type of event
   * @param {*} payload Value to send with callback
   */
  _emit (event, payload) {
    let i = 0
    while (i < this._events.length) {
      var cb = this._events[i]

      if (cb.event === event) {
        cb.fn.call(cb.scope || this, payload)

        if (cb.once) {
          this._events.splice(i, 1)
          continue
        }
      }

      i += 1
    }

    return this
  }
}
