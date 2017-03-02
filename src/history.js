/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree represents an action. Branches
 * are changes over time.
 */

import Action from './action'

export default function History (limit) {
  this.ids = 0
  this.size = 0
  this.limit = Math.max(1, limit || 1)
  this.repos = []

  this.append('_root').resolve()
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
    if (action == null) {
      throw new TypeError('Unable to checkout ' + action + ' action')
    }

    this.head = action

    this.setActiveBranch()

    this.reconcile(action)

    return this
  },

  append (command, status) {
    const action = new Action(command, this, status)

    if (this.size > 0) {
      action.parent = this.head

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
    let action = this.root

    while (this.size > this.limit && action.disposable) {
      this.size -= 1

      if (action.parent) {
        this.invoke('clean', action.parent)
        action.parent = null
      }

      action = action.next
    }

    this.root = action
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
