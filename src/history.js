import Action from './action'
import Emitter from './emitter'

import {
  inherit,
  merge
} from './utils'

import {
  BIRTH,
  START
} from './lifecycle'

const DEFAULTS = {
  maxHistory: 1,

  updater () {
    return update => update()
  }
}

/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree is an action. Branches are
 * changes over time.
 * @constructor
 */
export default function History (config) {
  Emitter.call(this)

  let { maxHistory, updater } = merge(DEFAULTS, config)

  this.size = 0
  this.limit = Math.max(1, maxHistory)

  this.updater = updater()
  this.release = () => this._emit('release')

  this.begin()
}

inherit(History, Emitter, {

  /**
   * Set the head of the tree to a target action. This has the effect
   * of controlling time in a Microcosm's history.
   * @param {Action} action The new head of the tree
   */
  checkout (action) {
    this.head = action || this.head

    this.setActiveBranch()

    this.reconcile(this.head)

    return this
  },

  /**
   * Toggle actions in bulk, then reconcile from the first action
   * @param {Action[]} - A list of actions to toggle
   * @public
   */
  toggle (actions) {
    let list = [].concat(actions)

    list.forEach(action => action.toggle('silently'))

    this.reconcile(list[0])
  },

  /**
   * Convert the active branch of history into an array.
   */
  toArray () {
    return this.map(n => n)
  },

  /**
   * Map over the active branch.
   */
  map (fn, scope) {
    let size = this.size
    let items = Array(size)
    let action = this.head

    while (size--) {
      items[size] = fn.call(scope, action)
      action = action.parent
    }

    return items
  },

  /**
   * Return a promise that represents the resolution of all actions in
   * the current branch.
   * @returns {Promise}
   */
  wait () {
    let actions = this.toArray()

    return new Promise ((resolve, reject) => {
      const checkStatus = () => {
        let done = actions.every(action => action.complete)
        let errors = actions.filter(action => action.is('reject'))

        if (done) {
          this.off('release', checkStatus)

          if (errors.length) {
            return reject(errors[0].payload)
          } else {
            resolve()
          }
        }
      }

      this.on('release', checkStatus)

      checkStatus()
    })
  },

  /**
   * Chain off of wait(). Provides a promise interface
   * @returns {Promise}
   */
  then (pass, fail) {
    return this.wait().then(pass, fail)
  },

  /**
   * Setup the head and root action for a history. This effectively
   * starts or restarts history.
   */
  begin () {
    this.head = this.root = null
    this.append(START, 'resolve')
  },

  append (command, status) {
    let action = new Action(command, status)

    if (this.size > 0) {
      this.head.lead(action)
    } else {
      // Always have a parent node, no matter what
      let birth = new Action(BIRTH, 'resolve')
      birth.adopt(action)

      this.root = action
    }

    this.head = action
    this.size += 1

    this._emit('append', action)

    action.on('change', this.reconcile, this)

    return this.head
  },

  /**
   * Remove an action from history, connecting adjacent actions
   * together to bridge the gap.
   * @param {Action} action - Action to remove from history
   */
  remove (action) {
    if (action.isDisconnected()) {
      return
    }

    let next = action.next
    let parent = action.parent

    this.clean(action)

    if (this.size <= 0) {
      this.begin()
      return
    } else if (!next) {
      next = this.head = parent
    } else if (action === this.root) {
      this.root = next
    }

    if (!action.disabled) {
      this.reconcile(next)
    }
  },

  /**
   * The actual clean up operation that purges an action from both
   * history, and removes all snapshots within tracking repos.
   * @param {Action} action - Action to clean up
   */
  clean (action) {
    this.size -= 1

    this._emit('remove', action)

    action.remove()
  },

  reconcile (action) {
    console.assert(this.head, 'History should always have a head node')
    console.assert(action, 'History should never reconcile ' + action)

    let focus = action

    while (focus) {
      this._emit('update', focus)

      if (focus === this.head) {
        break
      } else {
        focus = focus.next
      }
    }

    this.archive()

    this._emit('reconcile', action)

    this.updater(this.release)
  },

  archive () {
    let size = this.size
    let root = this.root

    while (size > this.limit && root.complete) {
      size -= 1
      this._emit('remove', root.parent)
      root = root.next
    }

    root.prune()

    this.root = root
    this.size = size
  },

  setActiveBranch () {
    let action = this.head
    let size = 1

    while (action !== this.root) {
      let parent = action.parent

      parent.next = action

      action = parent

      size += 1
    }

    this.size = size
  }

})
