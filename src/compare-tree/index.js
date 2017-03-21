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

export default function CompareTree (initial) {
  this.snapshot = initial
  this.nodes = {}
}

CompareTree.prototype = {

  /**
   * Create a subscription to a particular set of key paths.
   * @public
   * @param {String} keyPaths A list of key paths to trigger the callback
   * @param {Function} callback Function to execute when a key path changes
   * @param {*} [scope] Optional scope to invoke the function with
   */
  on (keyPaths, callback, scope) {
    let dependencies = getKeyPaths(keyPaths)
    let key = 'query:' + getKeyStrings(dependencies)

    let query = this.add(key, dependencies, 'query')

    for (var i = 0, len = dependencies.length; i < len; i++) {
      this.track(dependencies[i]).connect(query)
    }

    query.on('change', callback, scope)

    return query
  },

  /**
   * Remove a subscription created by .on()
   * @public
   * @param {String} keyPaths A list of key paths for the subscription
   * @param {Function} callback Associated callback function
   * @param {*} [scope] Associated scope
   */
  off (keyPaths, callback, scope) {
    let dependencies = getKeyPaths(keyPaths)
    let key = 'query:' + getKeyStrings(dependencies)

    let query = this.nodes[key]

    if (query) {
      query.off('change', callback, scope)

      if (query._events <= 0) {
        this.prune(query, dependencies)
      }
    }
  },

  /**
   * Compare a new snapshot to the last snapshot, triggering event
   * subscriptions a long the way.
   * @public
   * @param {*} state - New snapshot of state
   */
  update (snapshot) {
    let last = this.snapshot
    this.snapshot = snapshot

    let root = this.nodes[ROOT_KEY]

    if (root) {
      this.scan(root, last, snapshot)
    }
  },

  /**
   * Add a node to the tree if it has not otherwise been added.
   * @private
   * @param {String} id Identifier for the node.
   * @param {String} name Each node presents a property name in a nested object. This is that name.
   * @param {String} type Type of the node. This can be "query" or "binding"
   */
  add (id, name, type) {
    if (typeof this.nodes[id] === 'undefined') {
      this.nodes[id] = type === 'query' ? new Query(id, name) : new Node(id, name)
    }

    return this.nodes[id]
  },

  /**
   * Remove a node, then remove parents if they have no more edges.
   * @private
   * @param {String} node Starting node
   * @param {Array<String>} keyPaths determines the pathway to traverse
   */
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

  /**
   * Build up a branch of nodes given a path of keys
   * @private
   * @param {String} path A list of keys
   */
  track (path) {
    let last = this.add(ROOT_KEY, '')
    let keyBase = ''

    for (var i = 0, len = path.length; i < len; i++) {
      keyBase = keyBase ? `${keyBase}.${path[i]}` : path[i]

      var next = this.add(keyBase, path[i], 'binding')

      last.connect(next)

      last = next
    }

    return last
  },

  /**
   * Traverse the tree of subscriptions, triggering queries along the way
   * @private
   * @param {Node} root Starting point to scan
   * @param {*} from Starting snapshot
   * @param {*} from Next snapshot
   */
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
              edge.trigger(this.snapshot)
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
