/**
 * @fileoverview A node in a CompareTree represents a single key with
 * a JavaScript object.
 */
class Node {
  static getId(key, parent) {
    return parent && parent.id ? parent.id + '.' + key : key
  }

  /**
   * @param {String} id Identifier for the node.
   * @param {String} key String name of the key this node represents
   */
  constructor(id, key, parent) {
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
   * @public
   * @param {Node} node
   */
  connect(node) {
    if (node !== this && this.edges.indexOf(node) < 0) {
      this.edges.push(node)
    }
  }

  /**
   * Remove a node this instances list of edges.
   * @public
   * @param {Node} node
   */
  disconnect(node) {
    let index = this.edges.indexOf(node)

    if (~index) {
      this.edges.splice(index, 1)
    }
  }

  /**
   * Does a node have any edges?
   */
  isAlone() {
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
