/**
 * @flow
 * @fileoverview Emitter is an abstract class used by a few other
 * classes to communicate via events
 */

import { isFunction } from './utils'

type EventName = string

class Listener {
  event: EventName
  fn: Function
  scope: any
  once: boolean

  constructor(event: EventName, fn: Function, scope: any, once: boolean) {
    console.assert(isFunction(fn), `Expected ${event} listener to be function,`)

    this.event = event
    this.fn = fn
    this.scope = scope
    this.once = once
  }
}

/**
 * An abstract event emitter class. Several modules extend from this class
 * to utilize events.
 */
class Emitter {
  // A pool of event listeners
  _events: Array<Listener>

  constructor() {
    this._events = []
  }

  /**
   * Add an event listener.
   */
  on(event: EventName, fn: Function, scope: any) {
    let listener = new Listener(event, fn, scope, false)

    this._events.push(listener)

    return this
  }

  /**
   * Adds an `event` listener that will be invoked a single time then
   * automatically removed.
   */
  once(event: EventName, fn: Function, scope: any) {
    let listener = new Listener(event, fn, scope, true)

    this._events.push(listener)

    return this
  }

  /**
   * Unsubscribe a callback. If no event is provided, removes all callbacks. If
   * no callback is provided, removes all callbacks for the given type.
   */
  off(event: EventName, fn: Function, scope: any) {
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
  _emit(event: EventName, ...payload: Array<any>) {
    let i = 0
    while (i < this._events.length) {
      var cb = this._events[i]

      if (cb.event === event) {
        cb.fn.apply(cb.scope || this, payload)

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
