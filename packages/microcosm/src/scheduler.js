/**
 * @fileoverview The central scheduler for Microcosm work. This is
 * based upon Scheduler from the ChooJS project:
 * https://github.com/choojs/nanoscheduler/blob/master/index.js
 * @flow
 */

import assert from 'assert'

/**
 * The scheduler utilizes requestIdleCallback when it can. This
 * browser API exposes a time allotment to let developers know how
 * much time they have remaining before they will block the browser.
 *
 * Microcosm uses this API to prevent work from interfearing with
 * critical browser activities.
 */
type TimeShare = {
  timeRemaining: () => number
}

type Job = (...params: *[]) => void

type ErrorCallback = (error: Error) => void

const key = '__MICROCOSM_SCHEDULER__'
const hasWindow = typeof window !== 'undefined'
const root = hasWindow ? window : global

export function scheduler(): Scheduler {
  // TODO: This should probably be based upon the repo. Some sort of
  // root context
  if (!root[key]) {
    root[key] = new Scheduler(hasWindow)
  }

  return root[key]
}

const untilEmpty: TimeShare = {
  timeRemaining: () => 1
}

function idleFallback(callback: *): void {
  setTimeout(callback.bind(null, untilEmpty), 0)
}

class Scheduler {
  _method: *
  _tick: *
  _scheduled: boolean
  _queue: Job[]
  _errorCallbacks: ErrorCallback[]

  constructor(hasWindow: boolean) {
    let hasIdle = hasWindow && 'requestIdleCallback' in root

    this._method = hasIdle ? root.requestIdleCallback.bind(root) : idleFallback
    this._tick = this._tick.bind(this)
    this._scheduled = false
    this._queue = []
    this._errorCallbacks = []
  }

  push(job: Job): void {
    assert.equal(
      typeof job,
      'function',
      'scheduler.push: callback should be a function'
    )

    this._queue.push(job)
    this._schedule()
  }

  flush(): void {
    this._tick(untilEmpty)
  }

  onError(callback: ErrorCallback): void {
    this._errorCallbacks.push(callback)
  }

  offError(callback: ErrorCallback): void {
    let index = this._errorCallbacks.indexOf(callback)

    if (index >= 0) {
      this._errorCallbacks.splice(index, 1)
    }
  }

  then(pass: *, fail: *): Promise<void, Error> {
    return new Promise((resolve, reject) => {
      this.onError(reject)
      this.push(() => {
        resolve()
        this.offError(reject)
      })
    }).then(pass, fail)
  }

  // Private -------------------------------------------------- //

  _raise(error: Error): void {
    if (this._errorCallbacks.length) {
      this._errorCallbacks.forEach(callback => callback(error))
      this._errorCallbacks.length = 0
    } else {
      throw error
    }
  }

  _schedule(): void {
    if (this._scheduled) {
      return
    }

    this._scheduled = true
    this._method(this._tick)
  }

  _tick(idleDeadline: TimeShare): void {
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
