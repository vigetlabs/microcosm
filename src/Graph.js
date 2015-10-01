/**
 * Graph
 * A directed graph. Used to maintain a signal graph of transactions
 * over time.
 */

import assert from 'assert'

function Node(value, parent) {
  this.value    = value
  this.parent   = parent
  this.children = []
}

Node.prototype = {
  add(node) {
    this.children.push(node)
  },
  remove(node) {
    this.children.filter(child => child !== node)
  },
  dispose() {
    if (this.parent) {
      this.parent.remove(this)
    }
    this.children.forEach(child => child.parent = this.parent)
  },
  valueOf() {
    return this.value
  }
}

function Graph (anchor) {
  this.focus = null

  if (anchor != null) {
    this.append(anchor)
  }
}

Graph.prototype = {

  setFocus(node) {
    if (process.env.NODE_ENV !== 'production' && node === undefined) {
      throw new TypeError('Graph was asked to focus on invalid Node:' + node)
    }

    this.focus = node != null ? node : null
  },

  back() {
    this.setFocus(this.before(this.focus) || this.focus)
  },

  forward() {
    this.setFocus(this.after(this.focus) || this.focus)
  },

  remove(node) {
    assert(node instanceof Node, 'Graph::remove expects a Node')

    if (this.focus === node) {
      this.focus = this.after(node) || this.before(node)
    }

    node.dispose()

    return true
  },

  append(item) {
    let node = new Node(item, this.focus)

    if (this.focus) {
      this.focus.add(node)
    }

    // Do not execute setFocus. We know we have this edge
    this.focus = node

    return node
  },

  before(node) {
    assert(node instanceof Node, 'Graph::remove expects a Node')
    return node.parent
  },

  after(node) {
    assert(node instanceof Node, 'Graph::remove expects a Node')
    return node.children[node.children.length - 1]
  },

  prune(fn, scope) {
    let root = this.root()

    while (root && fn.call(scope, root.value, root)) {
      this.remove(root)
      root = this.after(root)
    }
  },

  path(values) {
    let next  = this.focus
    let items = []

    while (next) {
      items.push(next)
      next = this.before(next)
    }

    return items.reverse()
  },

  values() {
    let next  = this.focus
    let items = []

    while (next) {
      items.push(next.value)
      next = this.before(next)
    }

    return items.reverse()
  },

  root() {
    let next = this.focus

    while (next && next.parent) {
      next = next.parent
    }

    return next
  }

}

module.exports = Graph
