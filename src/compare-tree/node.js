export default function Node (id, key) {
  this.revision = -1
  this.id = id
  this.key = key
  this.edges = []
}

Node.prototype = {
  connect (node) {
    if (node !== this && this.edges.indexOf(node) < 0) {
      this.edges.push(node)
    }
  }
}
