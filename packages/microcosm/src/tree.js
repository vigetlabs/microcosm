/**
 * @flow
 */

import assert from 'assert'
import { iterator } from './symbols'

export class Tree<Node> {
  root: ?Subject
  head: ?Subject
  _backwards: Map<Node, Node>
  _forwards: Map<Node, Node>
  _branch: Set<Node>

  constructor() {
    this.root = null
    this.head = null

    this._backwards = new Map()
    this._forwards = new Map()
    this._branch = new Set()
  }

  point(before: Node, after: Node): void {
    this._backwards.set(after, before)
    this._forwards.set(before, after)
  }

  append(node: Node): void {
    this._branch.add(node)

    if (this.head) {
      this.point(this.head, node)
    } else {
      this.root = node
    }

    this.head = node
  }

  before(node: Node): ?Node {
    assert(node, 'Unable to locate node. Anchor is missing')
    return this._backwards.has(node) ? this._backwards.get(node) : null
  }

  after(node: Node): ?Node {
    assert(node, 'Unable to locate node. Anchor is missing')
    return this._forwards.has(node) ? this._forwards.get(node) : null
  }

  remove(node: Node): void {
    assert(node, 'Unable to remove missing node')

    let before = this._backwards.get(node)
    let after = this._forwards.get(node)
    let base = after || before

    if (before) {
      this._forwards.set(before, after)
    }

    if (after) {
      this._backwards.set(after, before)
    }

    this._forwards.delete(node)
    this._backwards.delete(node)
    this._branch.delete(node)

    if (this.head === node) {
      this.head = before
    }

    if (this.root === node) {
      this.root = after
      this._branch.add(after)
    }

    return after
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

  has(node: Node): boolean {
    return this._branch.has(node)
  }

  checkout(node: Node): void {
    assert(node, `Unable to checkout missing action`)

    this.head = node
    this._branch = new Set(this.select(node))
  }

  // $FlowFixMe
  [iterator]() {
    return this._branch[iterator]()
  }

  get size(): Number {
    return this._branch.size
  }
}
