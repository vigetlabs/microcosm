// @flow

import { Subject } from './subject'
import { Warehouse } from './warehouse'
import { Tree } from './data'
import { getSymbol } from './symbols'
import coroutine from './coroutine'

class History {
  constructor(options) {
    this._active = new Set()
    this._stream = new Tree()
    this._db = new Warehouse()

    this.root = null
    this.head = null

    this.debug = Boolean(options ? options.debug : false)
    this.updates = new Subject('updater')
  }

  get size() {
    return this._active.size
  }

  then(pass?: *, fail?: *): Promise<*> {
    return Promise.all(this)
  }

  stash(action, repo, payload) {
    this._db.set(action, repo, payload)
  }

  recall(action, repo) {
    return this._db.get(this._stream.before(action), repo)
  }

  previous(action) {
    return this._stream.before(action)
  }

  next(action) {
    return this._stream.after(action)
  }

  current(repo) {
    return this._db.get(this.head, repo)
  }

  archive() {
    while (this.root && this.root.closed && this.root !== this.head) {
      let last = this.root
      let next = this._stream.after(this.root)

      if (next && next.closed) {
        this._active.delete(last)
        this.remove(last, true)
      } else {
        break
      }
    }
  }

  append(command: string | Command, params, origin: *): Subject {
    let action = new Subject(command, { origin })

    this._active.add(action)

    if (this.head) {
      this._stream.point(this.head, action)
    } else {
      this.root = action
    }

    this.head = action

    action.every(this.updates.next)

    coroutine(action, command, params, origin)

    if (this.debug === false) {
      action.every(this.archive.bind(this))
    }

    return action
  }

  after(action) {
    return action === this.head ? undefined : this._stream.after(action)
  }

  wait() {
    return this.then()
  }

  remove(action) {
    let isActive = this.isActive(action)

    if (this.head === action) {
      this.head = this._stream.before(action)
    }

    let base = this._stream.remove(action)

    if (this.root === action) {
      this.root = base
    }

    this._db.delete(action)
    this._active.delete(action)

    if (isActive && base) {
      this.updates.next(base)
    }
  }

  toggle(action) {
    if (this._db.has(action)) {
      action.toggle()

      if (this.isActive(action)) {
        this.updates.next(action)
      }
    }
  }

  checkout(action) {
    if (!action) {
      throw new Error(`Unable to checkout ${action} action`)
    }

    let path = this._stream.select(action)

    this.head = action
    this._active = new Set(path)

    this.updates.next(path[0])
  }

  isActive(action) {
    return !action.disabled && this._active.has(action)
  }

  [getSymbol('iterator')]() {
    return this._active[getSymbol('iterator')]()
  }

  toJSON() {
    return {
      head: this.head ? this.head.id : null,
      root: this.root ? this.root.id : null,
      size: this.size,
      list: Array.from(this._active),
      tree: this._stream.toJS(this.root)
    }
  }
}

export default History
