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

    if (this.focus != null) {
      this.connect(action, this.focus)
    }

    this.focus = action

    if (this.root == null) {
      this.root = this.focus
    }

    return this.focus
  },

  /**
   * Append an action to another, making that action its parent. This
   * produces history.
   *
   * @api private
   *
   * @param {Action} child action to append
   * @param {Action} parent action to append to
   *
   * @returns {Tree} self
   */
  connect(child, parent) {
    child.parent  = parent
    child.sibling = parent.next
    child.depth   = parent.depth + 1

    parent.next   = child

    return this
  },

  prune(shouldRemove, scope) {
    while (this.root !== null && shouldRemove.call(scope, this.root)) {
      this.root = this.root.next || null
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
    let items = []

    items.length = size

    while (--size >= 0) {
      items[size] = node
      node = node.parent
    }

    return items
  },

  reduce(fn, state, scope) {
    let items = this.toArray()

    for (var i = 0, len = items.length; i < len; i++) {
      state = fn.call(scope, state, items[i], i)
    }

    return state
  },

  size() {
    return this.root ? 1 + (this.focus.depth - this.root.depth) : 0
  }
}
