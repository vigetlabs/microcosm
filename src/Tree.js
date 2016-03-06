/**
 * Each node represents a transaction. Branches are changes
 * over time.
 */

function Tree () {}

Tree.prototype = {
  anchor : null,
  focus  : null,

  checkout(node) {
    this.focus = node || this.focus
  },

  back() {
    if (this.focus) {
      this.checkout(this.focus.parent)
    }
  },

  forward() {
    if (this.focus) {
      this.checkout(this.focus.next)
    }
  },

  append(item) {
    this.focus  = new Node(item, this.focus)
    this.anchor = this.anchor || this.focus

    return this.focus
  },

  prune(shouldRemove, scope) {
    while (this.anchor && shouldRemove.call(scope, this.anchor.value)) {
      this.anchor = this.anchor.next
    }

    // If we reach the end (there is no next node), it means
    // we've completely wiped away the tree, so nullify focus
    // to mark a completely empty tree.
    if (!this.anchor) {
      this.focus = null
    }

    return this
  },

  reduce(fn, state, scope) {
    let node  = this.focus
    let size  = this.size()
    let items = Array(size)

    while (--size >= 0) {
      items[size] = node.value
      node = node.parent
    }

    for (var i = 0, len = items.length; i < len; i++) {
      state = fn.call(scope, state, items[i])
    }

    return state
  },

  root() {
    return this.anchor
  },

  size() {
    return this.anchor ? 1 + (this.focus.depth - this.anchor.depth) : 0
  }

}

function Node (value, parent) {
  this.parent = parent
  this.value  = value

  if (parent) {
    this.depth   = parent.depth + 1
    this.sibling = parent.next

    parent.next = this
  }
}

Node.prototype = {
  depth: 0,

  get children() {
    var start = this.next
    var nodes = []

    while (start) {
      nodes.push(start)
      start = start.sibling
    }
    return nodes
  }
}

export default Tree
