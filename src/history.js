import Action from './action'

import {
  BIRTH,
  START
} from './lifecycle'

/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree is an action. Branches are
 * changes over time.
 * @constructor
 */
export default function History (limit) {
  this.ids = 0
  this.size = 0
  this.limit = Math.max(1, limit || 1)
  this.repos = []

  this.begin()
}

History.prototype = {

  /**
   * Setup the head and root action for a history. This effectively
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

  checkout (action) {
    this.head = action || this.head

    this.setActiveBranch()

    this.reconcile(this.head)

    return this
  },

  append (command, status) {
    const action = new Action(command, status, this)

    if (this.size > 0) {
      action.follow(this.head)

      if (this.head.next) {
        this.head.next.right = action
        action.left = this.head.next
      }

      this.head.lead(action)
    } else {
      // Always have a parent node, no matter what
      action.follow(new Action(BIRTH, 'resolve', this))

      this.root = action
    }

    this.head = action
    this.size += 1

    this.invoke('createInitialSnapshot', action)

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

    if (action.disabled === false) {
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
    this.invoke('clean', action)

    action.remove()
  },

  reconcile (action) {
    console.assert(this.head, 'History should always have a head node')
    console.assert(action, 'History should never reconcile ' + action)

    let focus = action

    while (focus) {
      this.invoke('reconcile', focus)

      if (focus === this.head) {
        break
      } else {
        focus = focus.next
      }
    }

    this.archive()

    this.invoke('prepareRelease')

    this.invoke('release', action)
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
    let action = this.head
    let size = 1

    while (action !== this.root) {
      let parent = action.parent

      parent.next = action

      action = parent

      size += 1
    }

    this.size = size
  },

  /**
   * Toggle actions in bulk, then reconcile from the first action
   * @param {Action[]} - A list of actions to toggle
   */
  toggle (actions) {
    let list = [].concat(actions)

    list.forEach(action => action.toggle('silently'))

    this.reconcile(list[0])
  },

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

  toArray () {
    return this.map(n => n)
  }

}
