/**
 * @flow
 */

import assert from 'assert'

export class Tree<Node> {
  _backwards: Map<Node, Node>
  _forwards: Map<Node, Node>

  constructor() {
    this._backwards = new Map()
    this._forwards = new Map()
  }

  point(before: Node, after: Node) {
    this._backwards.set(after, before)
    this._forwards.set(before, after)
  }

  before(node: Node): ?Node {
    assert(node, 'Unable to locate node. Anchor is missing')
    return this._backwards.has(node) ? this._backwards.get(node) : null
  }

  after(node: Node): ?Node {
    assert(node, 'Unable to locate node. Anchor is missing')
    return this._forwards.has(node) ? this._forwards.get(node) : null
  }

  remove(node: Node): ?Node {
    assert(node, 'Unable to remove missing node')

    let before = this._backwards.get(node)
    let after = this._forwards.get(node)

    this._forwards.delete(node)
    this._backwards.delete(node)

    if (before && after) {
      if (this._forwards.get(before) === node) {
        this._forwards.set(before, after)
      }
      if (this._backwards.get(after) === node) {
        this._backwards.set(after, before)
      }
    }

    return after || before
  }

  select(node: Node): Node[] {
    let path = []

    while (node) {
      var before = this.before(node)

      path.push(node)

      if (before) {
        this.point(before, node)
        node = before
      } else {
        break
      }
    }

    return path.reverse()
  }

  children(node: Node): Node[] {
    let all = Array.from(this._backwards.keys())

    return all.filter(child => this._backwards.get(child) === node)
  }
}
