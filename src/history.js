import Task from './task'
import Emitter from './emitter'

import {
  inherit
} from './utils'

import {
  BIRTH,
  START
} from './lifecycle'

/**
 * The central tree data structure that is used to calculate state for a
 * Microcosm. Each node in the tree is an task. Branches are changes over
 * time.
 * @constructor
 */
export default function History (limit) {
  Emitter.call(this)

  this.ids = 0
  this.size = 0
  this.limit = Math.max(1, limit || 1)
  this.repos = []

  this.begin()
}

inherit(History, Emitter, {

  /**
   * Setup the head and root task for a history. This effectively
   * starts or restarts history.
   */
  begin () {
    this.head = this.root = null
    this.append(START, 'resolve')
  },

  getId () {
    return ++this.ids
  },

  addRepo (repo) {
    this.repos.push(repo)
  },

  removeRepo (repo) {
    let index = this.repos.indexOf(repo)

    if (~index) {
      this.repos.splice(index, 1)
    }
  },

  invoke (method, payload) {
    let repos = this.repos

    for (var i = 0; i < repos.length; i++) {
      console.assert(repos[i], `Missing repo! Was it removed before it could run repo.${method}?`)
      repos[i][method](payload)
    }
  },

  checkout (task) {
    this.head = task || this.head

    this.setActiveBranch()

    this.reconcile(this.head)

    return this
  },

  append (action, status) {
    let task = new Task(action, status, this)

    if (this.size > 0) {
      this.head.lead(task)
    } else {
      // Always have a parent node, no matter what
      let birth = new Task(BIRTH, 'resolve', this)
      birth.adopt(task)

      this.root = task
    }

    this.head = task
    this.size += 1

    this.invoke('createInitialSnapshot', task)

    this._emit('append', task)

    return this.head
  },

  /**
   * Remove an task from history, connecting adjacent tasks
   * together to bridge the gap.
   * @param {Task} task - Task to remove from history
   */
  remove (task) {
    if (task.isDisconnected()) {
      return
    }

    let next = task.next
    let parent = task.parent

    this.clean(task)

    if (this.size <= 0) {
      this.begin()
      return
    } else if (!next) {
      next = this.head = parent
    } else if (task === this.root) {
      this.root = next
    }

    if (!task.disabled) {
      this.reconcile(next)
    }
  },

  /**
   * The actual clean up operation that purges an task from both
   * history, and removes all snapshots within tracking repos.
   * @param {Task} task - Task to clean up
   */
  clean (task) {
    this.size -= 1
    this.invoke('removeSnapshot', task)

    task.remove()
  },

  reconcile (task) {
    console.assert(this.head, 'History should always have a head node')
    console.assert(task, 'History should never reconcile ' + task)

    let focus = task

    while (focus) {
      this.invoke('reconcile', focus)

      if (focus === this.head) {
        break
      } else {
        focus = focus.next
      }
    }

    this.archive()

    this.invoke('release', task)
  },

  archive () {
    let size = this.size
    let root = this.root

    while (size > this.limit && root.disposable) {
      size -= 1
      this.invoke('removeSnapshot', root.parent)
      root = root.next
    }

    root.prune()

    this.root = root
    this.size = size
  },

  setActiveBranch () {
    let task = this.head
    let size = 1

    while (task !== this.root) {
      let parent = task.parent

      parent.next = task

      task = parent

      size += 1
    }

    this.size = size
  },

  /**
   * Toggle tasks in bulk, then reconcile from the first task
   * @param {Task[]} - A list of tasks to toggle
   */
  toggle (tasks) {
    let list = [].concat(tasks)

    list.forEach(task => task.toggle('silently'))

    this.reconcile(list[0])
  },

  map (fn, scope) {
    let size = this.size
    let items = Array(size)
    let task = this.head

    while (size--) {
      items[size] = fn.call(scope, task)
      task = task.parent
    }

    return items
  },

  toArray () {
    return this.map(n => n)
  }

})
