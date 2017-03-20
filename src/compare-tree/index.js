import Node from './node'
import Query from './query'

import {
  getKeyPaths,
  getKeyString,
  getKeyStrings
} from './key-path'

import {
  castPath
} from '../utils'

const ROOT_KEY = '~'

export default function SubscriptionTree (initial) {
  this.state = initial
  this.nodes = {}
}

SubscriptionTree.prototype = {
  add (id, key, type) {
    if (typeof this.nodes[id] === 'undefined') {
      this.nodes[id] = type === 'query' ? new Query(id, key) : new Node(id, key)
    }

    return this.nodes[id]
  },

  prune (node, keyPaths) {
    for (var i = 0, len = keyPaths.length; i < len; i++) {
      let key = getKeyString(keyPaths[i])
      let parent = this.nodes[key]

      if (parent) {
        let index = parent.edges.indexOf(node)

        if (~index) {
          parent.edges.splice(index, 1)
        }

        if (parent.edges.length <= 0) {
          this.prune(parent, [castPath(parent.id).slice(0, -1)])
        }
      }
    }

    delete this.nodes[node.id]
  },

  track (path) {
    let last = this.add(ROOT_KEY, '')
    let keyBase = ''

    for (var i = 0, len = path.length; i < len; i++) {
      keyBase = keyBase ? `${keyBase}.${path[i]}` : path[i]

      var next = this.add(keyBase, path[i])

      last.connect(next)

      last = next
    }

    return last
  },

  on (keyPath, callback, scope) {
    let dependencies = getKeyPaths(keyPath)
    let key = 'query:' + getKeyStrings(dependencies)

    let query = this.add(key, dependencies, 'query')

    for (var i = 0, len = dependencies.length; i < len; i++) {
      this.track(dependencies[i]).connect(query)
    }

    query.on('change', callback, scope)

    return query
  },

  off (keyPath, callback, scope) {
    let dependencies = getKeyPaths(keyPath)
    let key = 'query:' + getKeyStrings(dependencies)

    let query = this.nodes[key]

    if (query) {
      query.off('change', callback, scope)

      if (query._events <= 0) {
        this.prune(query, dependencies)
      }
    }
  },

  update (state) {
    let last = this.state
    this.state = state

    let root = this.nodes[ROOT_KEY]

    if (root) {
      this.scan(root, last, state)
    }
  },

  scan (root, from, to) {
    let stack = [{ node: root, last: from, next: to }]

    while (stack.length) {
      var { node, last, next } = stack.pop()

      if (last !== next) {
        node.revision += 1

        var edges = node.edges
        for (var i = 0, len = edges.length; i < len; i++) {
          var edge = edges[i]

          if (node.revision > edge.revision) {
            edge.revision = node.revision

            if (edge instanceof Query) {
              edge.trigger(this.state)
            } else {
              stack.push({
                node: edge,
                last: last == null ? last : last[edge.key],
                next: next == null ? next : next[edge.key]
              })
            }
          }
        }
      }
    }
  }
}
