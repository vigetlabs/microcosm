/**
 * Each node represents a action. Branches are changes
 * over time.
 */

import Action from './action'

export default function Tree () {}

Tree.prototype = {
  root  : null,
  focus : null,

  checkout(node) {
    this.focus = node || this.focus
  },

  append(behavior) {
    const action = new Action(behavior)

    this.focus = action.appendTo(this.focus)

    this.root  = this.root || this.focus

    return this.focus
  },

  prune(shouldRemove, scope) {
    while (this.root && shouldRemove.call(scope, this.root)) {
      this.root = this.root.next
    }

    // If we reach the end (there is no next node), it means
    // we've completely wiped away the tree, so nullify focus
    // to mark a completely empty tree.
    if (!this.root) {
      this.focus = null
    }

    return this
  },

  toArray() {
    let node  = this.focus
    let size  = this.size()
    let items = Array(size)

    while (--size >= 0) {
      items[size] = node
      node = node.parent
    }

    return items
  },

  reduce(fn, state, scope) {
    let items = this.toArray()

    for (var i = 0, len = items.length; i < len; i++) {
      state = fn.call(scope, state, items[i])
    }

    return state
  },

  size() {
    return this.root ? 1 + (this.focus.depth - this.root.depth) : 0
  }
}
