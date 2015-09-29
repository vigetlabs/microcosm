/**
 * Graph
 * A directed graph. Used to maintain a signal graph of transactions
 * over time.
 */

function Graph (anchor) {
  this.edges = []
  this.focus = null

  if (anchor != null) {
    this.append(anchor)
  }
}

Graph.prototype = {

  has(node) {
    return this.edges.some(e => e.indexOf(node) >= 0)
  },

  setFocus(node) {
    this.focus = this.has(node) ? node : this.focus
  },

  remove(node) {
    if (this.focus === node) {
      this.focus = this.after(node)
    }

    this.edges = this.edges.filter(e => e.indexOf(node) < 0)
  },

  append(node) {
    if (this.focus) {
      this.edges.push([ this.focus, node ])
    }

    // Do not execute setFocus. We know we have this edge
    this.focus = node
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

  first() {
    return this.edges.length ? this.edges[0][0] : this.focus
  },

  children(node) {
    return this.edges.filter(edge => edge[0] === node)
                     .map(edge => edge[1])
  },

  tree(node) {
    node = node || this.first()

    return {
      node,
      children : this.children(node).map(this.tree, this)
    }
  },

  path() {
    let index = this.edges.length
    let focus = this.focus

    // We do not create an edge if there is no focus point.
    // We only assign focus. This way we do not have any nully nodes.
    // It also means this ternary is necessary:
    let items = focus ? [ focus ] : []

    while (index > 0) {
      var [ source, target ] = this.edges[--index]

      if (target === focus) {
        items.push(source)
        focus = source
      }
    }

    // reverse() is a few orders of magnitude faster than unshifting
    // into the array.
    return items.reverse()
  },

  walk(fn, scope) {
    let items = this.path()

    fn.call(scope, items.shift(), function step () {
      if (items.length) fn.call(scope, items.shift(), step)
    })
  }

}

module.exports = Graph
