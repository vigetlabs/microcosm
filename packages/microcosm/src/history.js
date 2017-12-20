// @flow

import { getSymbol } from './symbols'
import { Subject } from './subject'
import { Warehouse } from './warehouse'
import coroutine from './coroutine'

class History {
  constructor(options) {
    this._backwards = new Map()
    this._forwards = new Map()
    this._db = new Warehouse()

    this.debug = Boolean(options ? options.debug : false)
    this.updates = new Subject()
  }

  get size() {
    let count = this.root ? 1 : 0
    let focus = this.root

    while (focus !== this.head) {
      count += 1
      focus = this.after(focus)
    }

    return count
  }

  then(pass?: *, fail?: *): Promise<*> {
    return Promise.all([...this._backwards.values()])
  }

  stash(action, repo, payload) {
    this._db.set(action, repo, payload)
  }

  recall(action, repo) {
    return this._db.get(this._backwards.get(action), repo)
  }

  previous(action) {
    return this._backwards.get(action)
  }

  next(action) {
    return this._forwards.get(action)
  }

  current(repo) {
    return this._db.get(this.head, repo)
  }

  archive() {
    while (this.root && this.root.closed && this.root !== this.head) {
      let last = this.root
      let next = this._forwards.get(this.root)

      if (next && next.closed) {
        this.remove(last, true)
      } else {
        break
      }
    }
  }

  append(command: string | Command, params, origin: *): Subject {
    let action = new Subject(command)

    if (this.head) {
      this._forwards.set(this.head, action)
      this._backwards.set(action, this.head)
    } else {
      this.root = action
    }

    this.head = action

    this.updates.next(action)

    coroutine(action, command, params, origin)

    if (this.debug === false) {
      action.subscribe({
        complete: this.archive.bind(this)
      })
    }

    return action
  }

  after(action) {
    return action === this.head ? undefined : this._forwards.get(action)
  }

  wait() {
    return this.then()
  }

  remove(action, silent) {
    let before = this._backwards.get(action)
    let after = this._forwards.get(action)
    let base = after || before

    this._forwards.delete(action)
    this._backwards.delete(action)
    this._db.delete(action)

    if (this.head === action) {
      this._forwards.delete(before)
      this.head = before
    }

    if (this.root === action) {
      this.root = base
    }

    if (this._forwards.get(before) === action) {
      this._forwards.set(before, after)
    }

    if (this._backwards.get(after) === action) {
      this._backwards.set(after, before)
    }

    if (!silent && base && action.disabled === false) {
      this.updates.next(base)
    }
  }

  checkout(action) {
    if (!action) {
      throw new Error(`Unable to checkout ${action} action`)
    }

    let focus = action

    this.head = focus

    while (focus) {
      var previous = this._backwards.get(focus)

      if (previous) {
        this._forwards.set(previous, focus)
      }

      focus = previous
    }

    this.updates.next(action)
  }

  [getSymbol('iterator')]() {
    let focus = this.root

    return {
      _start: this.root,
      next: () => {
        if (focus) {
          let step = { value: focus, done: false }
          focus = this._forwards.get(focus)
          return step
        }

        // TODO: This is intended to help GC. Does this really do anything?
        focus = null

        return { done: true }
      }
    }
  }

  toggle(action) {
    if (this._db.has(action)) {
      action.toggle()
      this.updates.next(action)
    }
  }

  // TODO: This is probably extremely slow
  children(action) {
    let all = Array.from(this._backwards.keys())
    return all.filter(value => this._backwards.get(value) === action)
  }
}

export default History
