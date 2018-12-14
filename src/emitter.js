/**
 * @fileoverview Emitter is an abstract class used by a few other
 * classes to communicate via events
 * @flow
 */

import { isFunction } from './utils'
import assert from 'assert'

export type Callback = (...args: *[]) => *

type Listener = {
  event: string,
  fn: Callback,
  scope: ?Object,
  once: boolean
}

/**
 * An abstract event emitter class. Several modules extend from this
 * class to utilize events.
 */
class Emitter<Event: string> {
  _events: Array<Listener>

  constructor() {
    this._events = []
  }

  /**
   * Add an event listener.
   */
  on(event: Event, fn: Callback, scope?: any) {
    assert(
      isFunction(fn),
      `Expected ${event} listener to be function, instead got ${typeof fn}`
    )

    let listener = { event, fn, scope, once: false }

    this._events.push(listener)

    return this
  }

  /**
   * Adds an `event` listener that will be invoked a single time then
   * automatically removed.
   */
  once(event: Event, fn: Callback, scope?: any) {
    assert(
      isFunction(fn),
      `Expected ${event} listener to be function, instead got ${typeof fn}`
    )

    let listener = { event, fn, scope, once: true }

    this._events.push(listener)

    return this
  }

  /**
   * Unsubscribe a callback. If no event is provided, removes all callbacks. If
   * no callback is provided, removes all callbacks for the given type.
   */
  off(event: Event, fn: Callback, scope?: any) {
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
   */
  _emit(event: Event, ...args: Array<*>) {
    let i = 0
    while (i < this._events.length) {
      var cb: Listener = this._events[i]

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
  _removeScope(scope: any) {
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
