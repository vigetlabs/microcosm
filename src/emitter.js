/**
 * @fileoverview Emitter is an abstract class used by a few other
 * classes to communicate via events
 */

import { isFunction } from './utils'

class Listener {
  /**
   * @param {string} event Type of event
   * @param {Function} fn Event callback
   * @param {*} scope Scope of callback
   * @param {boolean} once Only run the event callback once
   */
  constructor(event, fn, scope, once) {
    console.assert(
      isFunction(fn),
      `Expected ${event} listener to be function, instead got ${fn}`
    )

    this.event = event
    this.fn = fn
    this.scope = scope
    this.once = once
  }
}

/**
 * An abstract event emitter class. Several modules extend from this class
 * to utilize events.
 * @property {Array.<Listener>} _events A pool of event listeners
 */
class Emitter {
  constructor() {
    this._events = []
  }

  /**
   * Add an event listener.
   * @param {string} event Type of event
   * @param {Function} fn Event callback
   * @param {*} [scope] Optional scope to invoke callback with
   */
  on(event, fn, scope) {
    let listener = new Listener(event, fn, scope, false)

    this._events.push(listener)

    return this
  }

  /**
   * Adds an `event` listener that will be invoked a single time then
   * automatically removed.
   * @param {string} event Type of event
   * @param {Function} fn Event callback
   * @param {*} [scope] Optional scope to invoke callback with
   */
  once(event, fn, scope) {
    let listener = new Listener(event, fn, scope, true)

    this._events.push(listener)

    return this
  }

  /**
   * Unsubscribe a callback. If no event is provided, removes all callbacks. If
   * no callback is provided, removes all callbacks for the given type.
   * @param {string} event Type of event
   * @param {Function} fn Event callback
   * @param {*} [scope] Optional scope to invoke callback with
   */
  off(event, fn, scope) {
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
  }

  /**
   * Purge all event listeners
   */
  removeAllListeners() {
    this._events.length = 0
  }

  /**
   * Emit `event` with the given args.
   * @param {string} event Type of event
   * @param {*} payload Value to send with callback
   */
  _emit(event, ...args) {
    let i = 0
    while (i < this._events.length) {
      var cb = this._events[i]

      if (cb.event === event) {
        cb.fn.apply(cb.scope || this, args)

        if (cb.once) {
          this._events.splice(i, 1)
          continue
        }
      }

      i += 1
    }

    return this
  }

  /**
   * Remove all events for a given scope
   */
  _removeScope(scope) {
    let i = 0
    while (i < this._events.length) {
      var cb = this._events[i]

      if (scope === cb.scope) {
        this._events.splice(i, 1)
        continue
      }

      i += 1
    }
  }
}

export default Emitter
