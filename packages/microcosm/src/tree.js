/**
 * @flow
 */

import assert from 'assert'
import { iterator } from './symbols'

function simplify(tree: Tree<Subject>, subject: Subject) {
  let base = subject.toJSON()

  base.children = tree.children(subject).map(simplify.bind(null, tree))

  return base
}

export class Tree<Node> {
  root: ?Subject
  head: ?Subject
  _backwards: Map<Node, Node>
  _forwards: Map<Node, Node>
  _branch: Set<Node>

  constructor(options: Object) {
    this.root = null
    this.head = null

    this._backwards = new Map()
    this._forwards = new Map()
    this._branch = new Set()
    this._payloads = new Map()
    this._limit = options.debug ? Infinity : Math.max(options.maxHistory, 0)
  }

  archive() {
    while (this.root && this.size > this._limit && this.root.closed) {
      let last = this.root
      let next = this.after(this.root)

      if (next && next.closed) {
        this.remove(last)
      } else {
        break
      }
    }
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

  set(node: Node, payload: *) {
    this._payloads.set(node, payload)
  }

  recall(node, fallback) {
    return this.get(this.before(node), fallback)
  }

  get(node: Node, fallback = null): * {
    while (node) {
      if (this._payloads.has(node)) {
        return this._payloads.get(node)
      } else {
        node = this.before(node)
      }
    }

    return fallback
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

    if (before) {
      this._forwards.set(before, after)
    }

    if (after) {
      this._backwards.set(after, before)
    }

    this._forwards.delete(node)
    this._backwards.delete(node)
    this._payloads.delete(node)
    this._branch.delete(node)

    if (this.head === node) {
      this.head = before
    }

    if (this.root === node) {
      this.root = after
      this._branch.add(after)
    }
  }

  checkout(node: Node) {
    assert(node, `Unable to checkout missing action`)

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

    this.head = node
    this._branch = new Set(path.reverse())
  }

  children(node: Node): Node[] {
    let all = Array.from(this._backwards.keys())

    return all.filter(child => this._backwards.get(child) === node)
  }

  hasValue(node: Node): boolean {
    return this._payloads.has(node)
  }

  // $FlowFixMe
  [iterator]() {
    return this._branch[iterator]()
  }

  get size(): Number {
    return this._branch.size
  }

  toJSON() {
    return {
      list: Array.from(this),
      tree: this.root ? simplify(this, this.root) : null,
      size: this.size
    }
  }
}
