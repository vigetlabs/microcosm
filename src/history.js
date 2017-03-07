/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree represents an action. Branches
 * are changes over time.
 *
 * @flow
 */

import Action from './action'

import {
  BIRTH,
  START
} from './lifecycle'

export default function History (limit) {
  this.ids = 0
  this.size = 0
  this.limit = Math.max(1, limit || 1)
  this.repos = []

  this.genesis = new Action(BIRTH, 'resolve', this)

  this.append(START, 'resolve')
}

History.prototype = {

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

    for (var i = 0, len = repos.length; i < len; i++) {
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

    action.parent = this.size ? this.head : this.genesis

    if (this.size > 0) {
      // To keep track of children, maintain a pointer to the first
      // child ever produced. We might checkout another child later,
      // so we can't use next
      if (this.head.first) {
        this.head.next.sibling = action
      } else {
        this.head.first = action
      }

      this.head.next = action
    } else {
      this.root = action
    }

    this.head = action
    this.size += 1

    return this.head
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

    this.invoke('release', action)
  },

  archive () {
    let size = this.size
    let root = this.root

    while (size > this.limit && root.disposable) {
      size -= 1
      this.invoke('clean', root.parent)
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

  // Toggle actions in bulk, then reconcile from the first action
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
