/**
 * Tree
 * Each node represents a transaction. Branches are changes
 * over time.
 */

function Tree () {}

Tree.prototype = {

  focus: null,

  checkout(node) {
    if (process.env.NODE_ENV !== 'production' && typeof node === 'undefined') {
      throw new TypeError('Tree was asked to focus on a Node, but instead got ' + node)
    }

    this.focus = node || this.focus
  },

  back() {
    if (this.focus) {
      this.checkout(this.focus.parent)
    }
  },

  forward() {
    if (this.focus) {
      this.checkout(this.focus.next())
    }
  },

  append(item) {
    this.focus = new Node(item, this.focus)
    return this.focus
  },

  prune(shouldRemove, scope) {
    let node = this.root()

    while (node && shouldRemove.call(scope, node.value)) {
      node.dispose()
      node = node.next()
    }

    // If we reach the end (there is no next node), it means
    // we've completely wiped away the tree, so nullify focus
    // to mark a completely empty tree.
    if (!node) {
      this.focus = null
    }
  },

  branch() {
    let node  = this.focus
    let items = []

    while (node) {
      items.push(node.value)
      node = node.parent
    }

    return items.reverse()
  },

  root() {
    let node = this.focus

    while (node && node.parent) {
      node = node.parent
    }

    return node
  },

  size() {
    let count = 0
    let node  = this.focus

    while (node) {
      node  = node.parent
      count = count + 1
    }

    return count
  }

}

function Node (value, parent) {
  this.children = []
  this.parent   = parent
  this.value    = value

  if (parent) {
    parent.children.unshift(this)
  }
}

Node.prototype = {

  next() {
    return this.children.length ? this.children[0] : null
  },

  dispose() {
    for (var i = 0, size = this.children.length; i < size; i++) {
      this.children[i].parent = null
    }
  }

}

export default Tree
