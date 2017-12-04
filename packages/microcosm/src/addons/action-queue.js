/**
 * A commonized way to track a set of outstanding actions associated
 * with another entity, like an ActionForm or ActionButton.
 * @flow
 */

import { type Action } from '../index.js'

class ActionQueue {
  _queue: Action[]
  _scope: any

  constructor(scope: any) {
    this._queue = []
    this._scope = scope
  }

  size(): number {
    return this._queue.length
  }

  push(action: Action, callbacks: ?Object): void {
    if (callbacks) {
      action.subscribe(callbacks)
    }

    action.subscribe({})

    this._queue.push(action)
  }

  empty(): void {
    for (var i = 0, len = this._queue.length; i < len; i++) {
      this._queue[i]._removeScope(this._scope)
    }

    this._queue.length = 0
  }

  /* Private ------------------------------------------------------ */

  _remove(action: Action): void {
    this._queue.splice(this._queue.indexOf(action), 1)
  }

  _clean(): void {
    for (var i = 0, len = this._queue.length; i < len; i++) {
      var action = this._queue[i]

      if (action.complete) {
        this._remove(action)
      }
    }
  }
}

export default ActionQueue
