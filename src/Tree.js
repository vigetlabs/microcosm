/**
 * Tree
 * Each node represents a transaction. Branches are changes
 * over time.
 */

function Tree (anchor) {
  this.focus = null

  if (anchor != null) {
    this.append(anchor)
  }
}

Tree.prototype = {

  setFocus(node) {
    if (process.env.NODE_ENV !== 'production' && typeof node === undefined) {
      throw new TypeError('Tree was asked to focus on invalid Node:' + node)
    }

    this.focus = node != null ? node : this.focus
  },

  back() {
    this.setFocus(this.focus.parent)
  },

  forward() {
    this.setFocus(this.focus.next)
  },

  remove(node) {
    if (this.focus === node) {
      this.focus = node.next || node.parent
    }

    node.dispose()

    return true
  },

  append(item) {
    let node = new Node(item, this.focus)

    // Do not execute setFocus. We know we have this edge
    this.focus = node

    return node
  },

  prune(fn, scope) {
    let root = this.root()

    while (root && fn.call(scope, root.value, root)) {
      this.remove(root)
      root = root.next
    }
  },

  size() {
    return this.reduce(n => n + 1, 0)
  },

  reduce(fn, value) {
    let node = this.root()

    while (node) {
      value = fn(value, node.value)

      if (this.focus === node) {
        break;
      }

      node = node.next
    }

    return value
  },

  root() {
    let next = this.focus

    while (next && next.parent) {
      next = next.parent
    }

    return next
  }

}

function Node (value, parent) {
  this.children = []
  this.next     = null
  this.parent   = parent
  this.value    = value

  if (parent) {
    parent.add(this)
  }
}

Node.prototype = {

  add(node) {
    let size = this.children.push(node)
    this.next = this.children[size - 1]
  },

  remove(node) {
    let size = this.children.filter(child => child !== node)
    this.next = this.children[this.children.length - 1]
  },

  dispose() {
    if (this.parent) {
      this.parent.remove(this)
    }

    this.children.forEach(child => child.parent = this.parent)
  }
}

module.exports = Tree
