/**
 * @fileoverview The central scheduler for Microcosm work. This is
 * based upon Scheduler from the ChooJS project:
 * https://github.com/choojs/nanoscheduler/blob/master/index.js
 */

import assert from 'assert'

const hasWindow = typeof window !== 'undefined'
const root = hasWindow ? window : global

const key = '__MICROCOSM_SCHEDULER__'

export function scheduler() {
  // TODO: This should probably be based upon the repo. Some sort of
  // root context
  if (!root[key]) {
    root[key] = new Scheduler(hasWindow)
  }

  return root[key]
}

const untilEmpty = {
  timeRemaining: () => 1
}

function idleFallback(callback) {
  setTimeout(callback, 0, untilEmpty)
}

class Scheduler {
  constructor(hasWindow) {
    let hasIdle = hasWindow && 'requestIdleCallback' in root

    this._method = hasIdle ? root.requestIdleCallback.bind(root) : idleFallback
    this._tick = this._tick.bind(this)
    this._scheduled = false
    this._queue = []
    this._errorCallbacks = []
  }

  push(cb) {
    assert.equal(
      typeof cb,
      'function',
      'scheduler.push: callback should be a function'
    )

    this._queue.push(cb)
    this._schedule()
  }

  flush() {
    this._tick(untilEmpty)
  }

  onError(fn) {
    this._errorCallbacks.push(fn)
  }

  offError(fn) {
    let index = this._errorCallbacks.indexOf(fn)

    if (index >= 0) {
      this._errorCallbacks.splice(index, 1)
    }
  }

  then(pass, fail) {
    return new Promise((resolve, reject) => {
      this.onError(reject)
      this.push(() => {
        resolve()
        this.offError(reject)
      })
    }).then(pass, fail)
  }

  // Private -------------------------------------------------- //

  _raise(error) {
    if (this._errorCallbacks.length) {
      this._errorCallbacks.forEach(callback => callback(error))
      this._errorCallbacks.length = 0
    } else {
      setTimeout(() => {
        throw error
      })
    }
  }

  _schedule() {
    if (this._scheduled) {
      return
    }

    this._scheduled = true
    this._method(this._tick)
  }

  _tick(idleDeadline) {
    try {
      while (this._queue.length && idleDeadline.timeRemaining() > 0) {
        this._queue.shift()()
      }
    } catch (error) {
      this._raise(error)
    }

    this._scheduled = false

    if (this._queue.length) {
      this._schedule()
    }
  }
}
