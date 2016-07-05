/**
 * Each node represents a action. Branches are changes over time.
 */

import Action from './action'

export default function Tree () {}

Tree.prototype = {
  root    : null,
  focus   : null,

  checkout(node) {
    this.focus = node || this.focus

    // Children are stored as a linked list. When we draw focus
    // to a node, we need to set it up as the first child, therefore
    // we need to move it to the beginning of this list, tying together
    // the surrounding nodes.
    //
    // While this may be a bit tedious, it lets use `reduce` forward
    // through pointer stepping, instead of building a list by
    // stepping backwards and refering. This is roughly 250% faster.
    if (this.size() > 1) {
      let { left, right } = this.focus

      if (left) {
        left.right = right
      }

      if (right) {
        right.left = left
      }

      // At this point, the
      this.connect(this.focus, this.focus.parent)
    }
  },

  append(behavior) {
    const action = new Action(behavior)

    if (this.focus) {
      this.connect(action, this.focus)
    } else {
      this.root = action
    }

    this.focus = action

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
    child.parent = parent
    child.depth  = parent.depth + 1

    if (parent.next) {
      parent.next.left = child
    }

    child.left  = null
    child.right = parent.next

    parent.next = child

    return this
  },

  prune(shouldRemove, scope) {
    let size = this.size()
    let node = this.root

    while (node && shouldRemove.call(scope, node, size--)) {
      node = node.next
    }

    this.root = node

    // If we reach the end (there is no next node), it means
    // we've completely wiped away the tree, so nullify focus
    // to mark a completely empty tree.
    if (node == null) {
      this.focus = null
    }

    return this
  },

  reduce(fn, state, scope) {
    let node = this.root
    let i    = 0

    while (node) {
      state = fn.call(scope, state, node, i++)

      if (node === this.focus) {
        break
      } else {
        node = node.next
      }
    }

    return state
  },

  size() {
    return this.root ? 1 + (this.focus.depth - this.root.depth) : 0
  }
}
