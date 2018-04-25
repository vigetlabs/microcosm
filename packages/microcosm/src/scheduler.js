/**
 * @fileoverview The central scheduler for Microcosm work
 * This is based upon Scheduler from the ChooJS project
 * https://github.com/choojs/nanoscheduler/blob/master/index.js
 */

import assert from 'assert'

const hasWindow = typeof window !== 'undefined'
const root = hasWindow ? window : global

export function scheduler() {
  // TODO: This should probably be based upon the repo. Some sort of
  // root context
  if (!root.__microcosmScheduler) {
    root.__microcosmScheduler = new Scheduler(hasWindow)
  }

  return root.__microcosmScheduler
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

    this.method = hasIdle ? root.requestIdleCallback.bind(root) : idleFallback
    this.tick = this.tick.bind(this)
    this.scheduled = false
    this.queue = []
    this.errorCallbacks = []
  }

  push(cb) {
    assert.equal(
      typeof cb,
      'function',
      'scheduler.push: callback should be a function'
    )

    this.queue.push(cb)
    this.schedule()
  }

  schedule() {
    if (this.scheduled) {
      return
    }

    this.scheduled = true
    this.method(this.tick)
  }

  tick(idleDeadline) {
    try {
      while (this.queue.length && idleDeadline.timeRemaining() > 0) {
        this.queue.shift()()
      }
    } catch (error) {
      this.raise(error)
    }

    this.scheduled = false

    if (this.queue.length) {
      this.schedule()
    }
  }

  flush() {
    this.tick(untilEmpty)
  }

  onError(fn) {
    this.errorCallbacks.push(fn)
  }

  raise(error) {
    if (this.errorCallbacks.length) {
      this.errorCallbacks.forEach(callback => callback(error))
      this.errorCallbacks.length = 0
    } else {
      setTimeout(() => {
        throw error
      })
    }
  }

  then(pass, fail) {
    return new Promise((resolve, reject) => {
      this.push(resolve)
      this.onError(reject)
    }).then(pass, fail)
  }

  get size() {
    return this.queue.length
  }
}
