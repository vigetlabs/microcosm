/**
 * @flow
 */

import { type Microcosm } from './microcosm'
import { Subject } from './subject'
import { Tree } from './tree'
import { tag } from './tag'
import { coroutine } from './coroutine'
import { iterator } from './symbols'

function simplify(tree: Tree<Subject>, subject: Subject) {
  let base = subject.toJSON()

  base.children = tree.children(subject).map(simplify.bind(null, tree))

  return base
}

export class History extends Subject {
  root: ?Subject
  head: ?Subject
  _branch: Set<Subject>
  _tree: Tree<Subject>
  _debug: boolean

  constructor(options: Object) {
    super()

    this.root = null
    this.head = null
    this._branch = new Set()
    this._tree = new Tree()
    this._debug = options ? options.debug : false
  }

  get size(): number {
    return this._branch.size
  }

  then(pass?: *, fail?: *): Promise<*> {
    // $FlowFixMe
    return Promise.all(this[iterator]())
  }

  archive() {
    while (this.root && this.size > 1 && this.root.closed) {
      let last = this.root
      let next = this._tree.after(this.root)

      if (next && next.closed) {
        this._branch.delete(last)
        this.remove(last)
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

  append(origin: Microcosm, command: Command, ...params: *[]): Subject {
    let action = new Subject(params[0], { key: String(tag(command)), origin })

    this._branch.add(action)

    if (this.head) {
      this._tree.point(this.head, action)
    } else {
      this.root = action
    }

    this.head = action

    let dispatch = this.dispatch.bind(this, action)

    action.subscribe({
      next: dispatch,
      error: dispatch,
      complete: dispatch,
      cancel: dispatch
    })

    try {
      coroutine(action, command, params, origin)
    } catch (x) {
      action.error(x)
      throw x
    }

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
    let isActive = this.isActive(action)

    if (this.head === action) {
      this.head = this.before(action)
    }

    let base = this._tree.remove(action)

    if (this.root === action) {
      this.root = base
    }

    if (isActive && base) {
      this._branch.delete(action)
      this.next(base)
    }
  }

  isActive(action: Subject) {
    return !action.disabled && this._branch.has(action)
  }

  toggle(action: Subject) {
    action.disabled = !action.disabled

    if (this._branch.has(action)) {
      this.next(action)
    }
  }

  checkout(action: ?Subject) {
    if (!action) {
      throw new Error(`Unable to checkout missing action`)
    }

    this.head = action
    this._branch = new Set(this._tree.select(action))
    this.next(action)
  }

  // $FlowFixMe
  [iterator]() {
    return this._branch[iterator]()
  }

  toJSON() {
    return {
      list: Array.from(this._branch),
      tree: this.root ? simplify(this._tree, this.root) : null,
      size: this.size
    }
  }
}
