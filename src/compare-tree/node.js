/**
 * A node in a CompareTree represents a single key with a JavaScript
 * object.
 * @constructor
 * @param {String} id Identifier for the node.
 * @param {String} key String name of the key this node represents
 */
export default function Node (id, key) {
  this.revision = -1
  this.id = id
  this.key = key
  this.edges = []
}

Node.prototype = {

  /**
   * Connect another node to this instance by adding it to
   * the list of edges.
   * @public
   * @param {Node} node
   */
  connect (node) {
    if (node !== this && this.edges.indexOf(node) < 0) {
      this.edges.push(node)
    }
  }

}
