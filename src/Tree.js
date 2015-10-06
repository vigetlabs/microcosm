/**
 * Tree
 * Each node represents a transaction. Branches are changes
 * over time.
 */

function Tree (anchor) {
  this.focus = null

  if (anchor) {
    this.append(anchor)
  }
}

Tree.prototype = {

  setFocus(node) {
    if (process.env.NODE_ENV !== 'production' && typeof node === undefined) {
      throw new TypeError('Tree was asked to focus on a Node, but instead got ' + node)
    }

    this.focus = node != null ? node : this.focus
  },

  back() {
    this.setFocus(this.focus.parent)
  },

  forward() {
    this.setFocus(this.focus.next())
  },

  append(item) {
    this.focus = new Node(item, this.focus)

    return this.focus
  },

  prune(fn) {
    let node = this.root()

    while (node != this.focus && fn(node.value)) {
      node.dispose()
      node = node.next()
    }
  },

  reduce(fn, initial) {
    let node  = this.focus
    let items = []

    while (node !== null) {
      items.push(node.value)
      node = node.parent
    }

    return items.reverse().reduce(fn, initial)
  },

  root() {
    let node = this.focus

    while (node !== null && node.parent !== null) {
      node = node.parent
    }

    return node
  },

  size() {
    let count = 0
    let next  = this.focus

    while (next !== null) {
      next = next.parent
      count = count + 1
    }

    return count
  }

}

function Node (value, parent) {
  this.children = []
  this.parent   = parent || null
  this.value    = value

  if (parent) {
    parent.children.unshift(this)
  }
}

Node.prototype = {

  next() {
    return this.children[0] || null
  },

  dispose() {
    for (var i = 0, size = this.children.length; i < size; i++) {
      this.children[i].parent = null
    }
  }

}

module.exports = Tree
