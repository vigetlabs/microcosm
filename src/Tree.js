/**
 * Tree
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
    this.focus = Node(item, this.focus)
    this.anchor  = this.anchor || this.focus

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

  reduce(fn, state) {
    let node  = this.focus
    let items = []

    while (node) {
      items.push(node.value)
      if (node === this.anchor) break
      node = node.parent
    }

    return items.reduceRight(fn, state)
  },

  root() {
    return this.anchor
  },

  size() {
    let count = 0
    let node  = this.anchor

    while (node) {
      node  = node.next
      count = count + 1
    }

    return count
  }

}

function Node (value, parent) {
  let node = { parent, value, children: [] }

  if (parent) {
    parent.children.push(node)
    parent.next = node
  }

  return node
}

export default Tree
