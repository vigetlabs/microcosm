/**
 * An abstract event emitter class. Several modules extend from this class
 * to utilize events.
 * @abstract
 */

export default function Emitter () {}

Emitter.prototype = {

  /**
   * Add an event listener.
   */
  on (event, fn, scope=this, times=Infinity) {
    const key = '$' + event

    if (!this._listeners) {
      this._listeners = {}
    }

    if (this._hasListener(event) === false) {
      this._listeners[key] = []
    }

    this._listeners[key].push({ fn, scope, times })

    return this
  },

  /**
   * Adds an `event` listener that will be invoked a single time then
   * automatically removed.
   */
  once (event, fn, scope) {
    return this.on(event, fn, scope, 0)
  },

  /**
   * Determine if a listener has been subscribed to
   * @private
   */
  _hasListener(event) {
    if (this._listeners == null || event == null)  {
      return false
    }

    return this._listeners['$' + event] != null
  },

  /**
   * Unsubscribe a callback. If no event is provided, removes all callbacks. If
   * no callback is provided, removes all callbacks for the given type.
   */
  off (event, fn, scope=this) {
    // Remove all listeners
    if (event == null) {
      delete this._listeners
    }

    if (this._hasListener(event) === false) {
      return this
    }

    let key = '$' + event

    // remove all handlers
    if (fn == null) {
      delete this._listeners[key]
      return this
    }

    // specific event
    let callbacks = this._listeners[key]

    // Remove the specific handler, splice so that listeners removed
    // during another event broadcast are not invoked
    let i = 0;
    while (i < callbacks.length) {
      let cb = callbacks[i]

      if (cb.fn === fn && cb.scope === scope) {
        callbacks.splice(i, 1)
      } else {
        i += 1
      }
    }

    return this
  },

  /**
   * Emit `event` with the given args.
   * @private
   */
  _emit (event, ...params) {
    if (this._hasListener(event) === false) {
      return this
    }

    let callbacks = this._listeners['$' + event]

    let i = 0;
    while (i < callbacks.length) {
      let callback = callbacks[i]

      callback.fn.apply(callback.scope, params)
      callback.times -= 1

      if (callback.times <= 0) {
        callbacks.splice(i, 1)
      } else {
        i += 1;
      }
    }

    return this
  }

}
