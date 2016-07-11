/**
 * EventEmitter
 *
 * This is a private event emitter based upon the component/emitter
 * implementation. It enforces a few constraints to ensure users of
 * Microcosm have a good time:
 *
 * - `emit` is private
 * - subscriptions can be prioritized (to improve rendering efficiency)
 *
 * component/emitter:
 * https://github.com/component/emitter/pull/74/files
 */

import merge from './merge'

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */
export default function Emitter (obj) {
  return merge(obj, Emitter.prototype)
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function (event, fn, reverse){
  this._callbacks = this._callbacks || {}

  const callback = this._callbacks['$' + event] = this._callbacks['$' + event] || []

  /**
   * Reversing priority helps addons like 'Connect' and 'Presenter'
   * work more efficiently. It allows changes to occur "top down"
   * instead of "bottom up". This is because event subscription occurs
   * within React lifecycle methods, which prioritize children before
   * parents.
   */
  reverse ? callback.unshift(fn) : callback.push(fn)

  return this
}

/**
 * Adds an `event` listener that will be invoked a single time then
 * automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function (event, fn, reverse){
  function on() {
    this.off(event, on)
    fn.apply(this, arguments)
  }

  on.fn = fn

  this.on(event, on, reverse)

  return this
}

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function (event, fn){
  // Remove all listeners
  if (0 == arguments.length) {
    delete this._callbacks
  }

  if (!this._callbacks || this._callbacks.hasOwnProperty('$' + event) === false) {
    return this
  }

  // specific event
  let callbacks = this._callbacks['$' + event]

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event]
    return this
  }

  // Remove the specific handler
  callbacks = callbacks.filter(cb => !(cb === fn || cb.fn === fn))

  /**
   * Remove event specific arrays for event types that no
   + one is subscribed for to avoid memory leak.
   */
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event]
  } else {
    this._callbacks['$' + event] = callbacks
  }

  return this
}

/**
 * Emit `event` with the given args.
 *
 * @api private
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */
Emitter.prototype._emit = function (event, ...params) {
  if (!this._callbacks) {
    return this
  }

  const callbacks = this._callbacks['$' + event]

  if (callbacks) {
    for (let i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, params)
    }
  }

  return this
}
