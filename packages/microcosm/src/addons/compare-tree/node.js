/**
 * @fileoverview A node in a CompareTree represents a single key with
 * a JavaScript object.
 * @flow
 */

import type Query from './query'

class Node {
  id: string
  key: string
  parent: ?Node
  edges: Array<Node | Query>

  static getId(key, parent) {
    return parent && parent.id ? parent.id + '.' + key : key
  }

  constructor(id: string, key: string, parent: ?Node) {
    this.id = id
    this.key = key
    this.edges = []
    this.parent = parent || null

    if (parent) {
      parent.connect(this)
    }
  }

  /**
   * Connect another node to this instance by adding it to
   * the list of edges.
   */
  connect(node: Node | Query) {
    console.assert(
      this.edges.indexOf(node) <= 0,
      node.id + ' is already connected to ' + this.id
    )

    console.assert(
      node !== this,
      'Unable to connect node ' + node.id + ' to self.'
    )

    this.edges.push(node)
  }

  /**
   * Remove a node this instances list of edges.
   */
  disconnect(node: Node | Query) {
    let index = this.edges.indexOf(node)

    if (~index) {
      this.edges.splice(index, 1)
    }
  }

  /**
   * Does a node have any edges?
   */
  isAlone(): boolean {
    return this.edges.length <= 0
  }

  /**
   * Disconnect from a parent
   */
  orphan() {
    if (this.parent) {
      this.parent.disconnect(this)
    }
  }
}

export default Node
