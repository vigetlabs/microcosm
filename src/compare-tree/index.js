import Node from './node'
import Query from './query'

import { getKeyPaths, getKeyString } from '../key-path'

// The root key is an empty string. This can be a little
// counter-intuitive, so we keep track of them as a named constant.
const ROOT_PATH = ''

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
    let id = Query.getId(keyPaths)

    let query = this.addQuery(id, dependencies)

    for (var i = 0; i < dependencies.length; i++) {
      this.addBranch(dependencies[i], query)
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
    let id = Query.getId(keyPaths)

    let query = this.nodes[id]

    if (query) {
      query.off('change', callback, scope)

      if (query.isAlone()) {
        this.prune(query)
      }
    }
  },

  /**
   * Compare a new snapshot to the last snapshot, triggering event
   * subscriptions along the way.
   * @public
   * @param {*} state - New snapshot of state
   */
  update (snapshot) {
    let last = this.snapshot
    this.snapshot = snapshot

    let root = this.nodes[ROOT_PATH]

    if (root) {
      var queries = this.scan(this.nodes[ROOT_PATH], last, snapshot, [])

      for (var i = 0; i < queries.length; i++) {
        queries[i].trigger(snapshot)
      }
    }
  },

  /**
   * Add a node to the tree if it has not otherwise been added.
   * @private
   * @param {String} id Identifier for the node.
   * @param {String} key Each node represents a key in a nested object.
   * @param {Node} parent Parent to connect this node to.
   */
  addNode (key, parent) {
    let id = Node.getId(key, parent)

    if (!this.nodes[id]) {
      this.nodes[id] = new Node(id, key, parent)
    }

    return this.nodes[id]
  },

  /**
   * Add a query to the tree if it has not otherwise been
   * added. Queries are leaf nodes responsible for managing
   * subscriptions.
   * @private
   * @param {String} id Identifier for the node.
   * @param {String} keyPaths Each query tracks a list of key paths
   */
  addQuery (id, keyPaths) {
    if (!this.nodes[id]) {
      this.nodes[id] = new Query(id, keyPaths)
    }

    return this.nodes[id]
  },

  /**
   * Remove a node from this tree.
   * @private
   * @param {Node} node Node to remove
   */
  remove (node) {
    delete this.nodes[node.id]
  },

  /**
   * Remove a query, then traverse that queries key paths to remove
   * unused parents.
   * @private
   * @param {Query} query Query to remove
   */
  prune (query) {
    let ids = query.keyPaths.map(getKeyString)

    for (var i = 0, len = ids.length; i < len; i++) {
      let node = this.nodes[ids[i]]

      node.disconnect(query)

      do {
        if (node.isAlone()) {
          node.orphan()
          this.remove(node)
        } else {
          break
        }

        node = node.parent
      } while (node)
    }

    this.remove(query)
  },

  /**
   * Build up a branch of nodes given a path of keys, appending a query
   * to the end.
   * @private
   * @param {String} path A list of keys
   * @param {Query} query Query to append to the end of the branch
   */
  addBranch (path, query) {
    let last = this.addNode(ROOT_PATH, null)

    for (var i = 0, len = path.length; i < len; i++) {
      last = this.addNode(path[i], last)
    }

    last.connect(query)
  },

  /**
   * Traverse the tree of subscriptions, triggering queries along the way
   * @private
   * @param {Node} root Starting point to scan
   * @param {*} from Starting snapshot
   * @param {*} from Next snapshot
   */
  scan (node, last, next, queries) {
    if (last !== next) {
      var edges = node.edges

      for (var i = 0, len = edges.length; i < len; i++) {
        var edge = edges[i]

        if (edge instanceof Query && queries.indexOf(edge) < 0) {
          queries.push(edge)
        } else {
          var edgeLast = last == null ? last : last[edge.key]
          var edgeNext = next == null ? next : next[edge.key]

          this.scan(edge, edgeLast, edgeNext, queries)
        }
      }
    }

    return queries
  }
}
