/**
 * @flow
 */

import { Subject } from './subject'
import { Tree } from './tree'
import { coroutine } from './coroutine'
import { iterator } from './symbols'
import { tag } from './tag'

function simplify(tree: Tree<Subject>, subject: Subject) {
  let base = subject.toJSON()

  base.children = tree.children(subject).map(simplify.bind(null, tree))

  return base
}

export class History extends Subject {
  _tree: Tree<Subject>
  _debug: boolean
  _limit: number

  constructor(options: Object) {
    super()

    this._tree = new Tree()
    this._debug = !!options.debug
    this._limit = Math.max(options.maxHistory, 0)
  }

  get head() {
    return this._tree.head
  }

  get root() {
    return this._tree.root
  }

  get size(): number {
    return this._tree.size
  }

  then(pass?: *, fail?: *): Promise<*> {
    // $FlowFixMe
    return Promise.all(this[iterator]()).then(pass, fail)
  }

  archive() {
    while (this.root && this.size > this._limit && this.root.closed) {
      let last = this.root
      let next = this._tree.after(this.root)

      if (next && next.closed) {
        this._tree.remove(last)
      } else {
        break
      }
    }
  }

  dispatch(action: Subject): void {
    this.next(action)

    if (action.closed && !this._debug) {
      this.archive()
    }
  }

  append(origin: *, command: Command, ...params: *[]): Subject {
    let action = new Subject(undefined, {
      key: tag(command).toString(),
      origin
    })

    this._tree.append(action)

    action.every(this.dispatch, this)

    coroutine(action, command, params, origin)

    return action
  }

  before(action: Subject): ?Subject {
    return this._tree.before(action)
  }

  after(action: Subject): ?Subject {
    return action === this.head ? null : this._tree.after(action)
  }

  wait() {
    return this.then()
  }

  remove(action: Subject) {
    let after = this._tree.remove(action)

    if (after) {
      this.next(after)
    }
  }

  toggle(action: Subject) {
    action.disabled = !action.disabled

    if (this._tree.has(action)) {
      this.next(action)
    }
  }

  checkout(action: ?Subject) {
    this._tree.checkout(action)
    this.next(action)
  }

  // $FlowFixMe
  [iterator]() {
    return this._tree[iterator]()
  }

  toJSON() {
    return {
      list: Array.from(this._tree),
      tree: this.root ? simplify(this._tree, this.root) : null,
      size: this.size
    }
  }
}
