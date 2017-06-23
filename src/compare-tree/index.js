/**
 * @flow
 * @private
 */

import Node from './node'
import Query from './query'
import { getKeyString, type KeyPath } from '../key-path'

// The root key is an empty string. This can be a little
// counter-intuitive, so we keep track of them as a named constant.
const ROOT_PATH = ''

class CompareTree {
  snapshot: Object
  nodes: { [key: string]: Node }
  queries: { [key: string]: Query }

  constructor(initial: Object) {
    this.snapshot = initial
    this.nodes = {}
    this.queries = {}
  }

  /**
   * Create a subscription to a particular set of key paths.
   */
  on(keyPaths: Array<KeyPath>, callback: Function, scope?: Object) {
    let query = this.addQuery(keyPaths)

    query.on('change', callback, scope)

    query.forEachPath(this.addBranch, this)

    return query
  }

  /**
   * Remove a subscription created by .on()
   */
  off(keyPaths: string | Array<KeyPath>, callback: Function, scope?: Object) {
    let id = Query.getId(keyPaths)

    let query: Query = this.queries[id]

    if (query) {
      query.off('change', callback, scope)

      if (query.isAlone()) {
        this.prune(query)
      }
    }
  }

  /**
   * Compare a new snapshot to the last snapshot, triggering event
   * subscriptions along the way.
   */
  update(snapshot: Object) {
    let last = this.snapshot
    this.snapshot = snapshot

    let root = this.nodes[ROOT_PATH]

    if (root) {
      var queries = this.scan(this.nodes[ROOT_PATH], last, snapshot, [])

      for (var i = 0; i < queries.length; i++) {
        queries[i].trigger(snapshot)
      }
    }
  }

  /**
   * Add a node to the tree if it has not otherwise been added.
   */
  addNode(key: string, parent: ?Node) {
    let id = Node.getId(key, parent)

    if (!this.nodes[id]) {
      this.nodes[id] = new Node(id, key, parent)
    }

    return this.nodes[id]
  }

  /**
   * Add a query to the tree if it has not otherwise been
   * added. Queries are leaf nodes responsible for managing
   * subscriptions.
   */
  addQuery(dependencies: string | Array<KeyPath>): Query {
    let id = Query.getId(dependencies)

    if (!this.queries[id]) {
      this.queries[id] = new Query(id, dependencies)
    }

    return this.queries[id]
  }

  /**
   * Remove a query, then traverse that queries key paths to remove
   * unused parents.
   */
  prune(query: Query) {
    let ids = query.keyPaths.map(getKeyString)

    for (var i = 0, len = ids.length; i < len; i++) {
      let node = this.nodes[ids[i]]

      node.disconnect(query)

      do {
        if (node.isAlone()) {
          node.orphan()
          delete this.nodes[node.id]
        } else {
          break
        }

        node = node.parent
      } while (node)
    }

    delete this.queries[query.id]
  }

  /**
   * Build up a branch of nodes given a path of keys, appending a query
   * to the end.
   */
  addBranch(path: KeyPath, query: Query) {
    let last = this.addNode(ROOT_PATH, null)

    for (var i = 0, len = path.length; i < len; i++) {
      last = this.addNode(path[i], last)
    }

    last.connect(query)
  }

  /**
   * Traverse the tree of subscriptions, triggering queries along the way
   */
  scan(node: Node, last: *, next: *, queries: Array<Query>) {
    if (last !== next) {
      var edges = node.edges

      for (var i = 0, len = edges.length; i < len; i++) {
        var edge = edges[i]

        if (edge instanceof Query && queries.indexOf(edge) < 0) {
          queries.push(edge)
        } else if (edge instanceof Node) {
          var edgeLast = last == null ? last : last[edge.key]
          var edgeNext = next == null ? next : next[edge.key]

          this.scan(edge, edgeLast, edgeNext, queries)
        }
      }
    }

    return queries
  }
}

export default CompareTree
