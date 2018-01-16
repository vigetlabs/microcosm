// @flow

import { tag } from './tag'
import { Subject } from './subject'
import { Tree } from './data'
import { getSymbol } from './symbols'
import coroutine from './coroutine'

class History {
  constructor(options) {
    this.root = null
    this.head = null
    this.updates = new Subject()

    this._active = new Set()
    this._stream = new Tree()

    this._debug = options ? options.debug : false
  }

  get size() {
    return this._active.size
  }

  then(pass?: *, fail?: *): Promise<*> {
    return Promise.all(this)
  }

  archive() {
    while (this.size > 1 && this.root.closed) {
      let last = this.root
      let next = this._stream.after(this.root)

      if (next && next.closed) {
        // Delete the action from the active list to prevent
        // dispatch
        this._active.delete(last)
        this.remove(last)
      } else {
        break
      }
    }
  }

  append(origin, command, ...params) {
    let action = new Subject(params[0], { tag: '' + tag(command), origin })

    this._active.add(action)

    if (this.head) {
      this._stream.point(this.head, action)
    } else {
      this.root = action
    }

    this.head = action

    this.updates.next(action)

    if (this._debug === false) {
      action.subscribe({
        cleanup: this.archive.bind(this, action)
      })
    }

    try {
      coroutine(action, command, params, origin)
    } catch (x) {
      action.error(x)
      throw x
    }

    return action
  }

  before(action) {
    return this._stream.before(action)
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
      this.head = this.before(action)
    }

    let base = this._stream.remove(action)

    if (this.root === action) {
      this.root = base
    }

    if (isActive && base) {
      this._active.delete(action)
      this.updates.next(base)
    }
  }

  isActive(action) {
    return !action.disabled && this._active.has(action)
  }

  toggle(action) {
    action.toggle()

    if (this._active.has(action)) {
      this.updates.next(action)
    }
  }

  checkout(action) {
    if (!action) {
      throw new Error(`Unable to checkout ${action} action`)
    }

    this.head = action
    this._active = new Set(this._stream.select(action))
    this.updates.next(action)
  }

  [getSymbol('iterator')]() {
    return this._active[getSymbol('iterator')]()
  }

  toJSON() {
    return {
      head: this.head ? this.head.id : null,
      root: this.root ? this.root.id : null,
      list: Array.from(this._active),
      tree: this._stream.toJS(this.root),
      size: this.size
    }
  }
}

export default History
