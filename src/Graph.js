/**
 * Graph
 * A directed graph. Used to maintain a signal graph of transactions
 * over time.
 */

let assert = require('assert')

function Graph (nodes, edges) {
  this.nodes = nodes || []
  this.edges = edges || []
  this.focus = this.nodes[0]
}

Graph.prototype = {

  has(node) {
    return this.nodes.indexOf(node) > -1
  },

  setFocus(node) {
    this.focus = this.has(node) ? node : this.focus
  },

  add(node) {
    assert(node != null, 'Graph unable to add node for ' + node)

    if (this.has(node) === false) {
      this.nodes.push(node)
    }

    this.focus = node
  },

  remove(node) {
    if (this.focus === node) {
      this.focus = this.after(node)
    }

    this.nodes = this.nodes.filter(n => n !== node)
    this.edges = this.edges.filter(e => e.indexOf(node) < 0)
  },

  connect(source, target) {
    this.add(source)
    this.add(target)

    this.edges.push([ source, target ])
  },

  append(node) {
    this.focus ? this.connect(this.focus, node) : this.add(node)
  },

  before(node) {
    for (var i = this.edges.length - 1; i >= 0; i--) {
      if (this.edges[i][1] === node) return this.edges[i][0]
    }
    return null
  },

  after(node) {
    for (var i = this.edges.length - 1; i >= 0; i--) {
      if (this.edges[i][0] === node) return this.edges[i][1]
    }
    return null
  },

  pathway() {
    let next  = this.focus
    let items = []

    while (next) {
      items.unshift(next)
      next = this.before(next)
    }

    return items
  },

  walk(fn, scope) {
    let items = this.pathway()

    fn.call(scope, items.shift(), function step () {
      if (items.length) fn.call(scope, items.shift(), step)
    })
  }

}

module.exports = Graph
