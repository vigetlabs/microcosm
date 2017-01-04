/**
 * An abstract event emitter class. Several modules extend from this class
 * to utilize events.
 * @constructor
 */

export default function Emitter () {
  this._events = []
}

Emitter.prototype = {

  /**
   * Add an event listener.
   */
  on (event, fn, scope, once) {
    this._events.push({ event, fn, scope, once })
    return this
  },

  /**
   * Adds an `event` listener that will be invoked a single time then
   * automatically removed.
   */
  once (event, fn, scope) {
    return this.on(event, fn, scope, true)
  },

  /**
   * Unsubscribe a callback. If no event is provided, removes all callbacks. If
   * no callback is provided, removes all callbacks for the given type.
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

  removeAllListeners () {
    this._events.length = 0
  },

  /**
   * Emit `event` with the given args.
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
