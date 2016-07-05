/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

import merge from './merge'

export default function Emitter(obj) {
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
Emitter.prototype.addEventListener = function (event, fn){
  this._callbacks = this._callbacks || {}

  const callback = this._callbacks['$' + event] = this._callbacks['$' + event] || []

  callback.push(fn)

  return this
}

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function (event, fn){
  function on() {
    this.off(event, on)
    fn.apply(this, arguments)
  }

  on.fn = fn

  this.on(event, on)

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
  this._callbacks = this._callbacks || {}

  // all
  if (0 == arguments.length) {
    this._callbacks = {}
    return this
  }

  // specific event
  var callbacks = this._callbacks['$' + event]

  if (!callbacks) return this

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event]
    return this
  }

  // remove specific handler
  var cb
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i]
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1)
      break
    }
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
  this._callbacks = this._callbacks || {}

  let callbacks = this._callbacks['$' + event]

  if (callbacks) {
    callbacks = callbacks.slice(0)

    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, params)
    }
  }

  return this
}
