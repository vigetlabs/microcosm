/**
 * @flow
 */

import { Subject } from './subject'
import { Warehouse } from './warehouse'
import coroutine from './coroutine'
import tag from './tag'
import { INACTIVE, START, COMPLETE, NEXT, ERROR } from './lifecycle'

function standardAction(command) {
  return {
    meta: { status: INACTIVE, command, closed: false },
    error: false,
    payload: null
  }
}

class History {
  _root: Action
  _head: Action

  constructor(options) {
    this.debug = Boolean(options ? options.debug : false)

    this._downstream = new Map()
    this._upstream = new Map()
    this._db = new Warehouse()

    this.updates = new Subject()
  }

  then(pass?: *, fail?: *): Promise<*> {
    return Promise.all([...this._downstream.values()])
  }

  stash(action, repo, payload) {
    this._db.set(action, repo, payload)
  }

  recall(action, repo) {
    return this._db.get(this._upstream.get(action), repo)
  }

  current(repo) {
    return this._db.get(this._head, repo)
  }

  archive() {
    if (this.debug) {
      return
    }

    while (this.size > 1 && this._root.meta.closed) {
      let last = this._root
      let next = this._downstream.get(this._root)

      if (next && next.meta.closed) {
        this._root = next
        this._db.delete(last)
        this._upstream.delete(last)
        this._downstream.delete(last)
      } else {
        break
      }
    }
  }

  append(command: string | Command, params: *[], origin: Microcosm): Action {
    command = tag(command)

    let revision = standardAction(command)
    let action = new Subject()

    if (this.size > 0) {
      this._downstream.set(this._head, revision)
      this._upstream.set(revision, this._head)
    } else {
      this._root = revision
    }

    this._head = revision

    action.subscribe({
      start: didStart.bind(null, this, revision),
      next: didNext.bind(null, this, revision),
      complete: didComplete.bind(null, this, revision),
      error: didError.bind(null, this, revision)
    })

    coroutine(action, command, params, origin)

    return action
  }

  after(action) {
    return action === this.head ? null : this._downstream.get(action)
  }

  get size() {
    return this._head ? this._upstream.size + 1 : 0
  }
}

function didStart(history, revision) {
  revision.meta.status = START
  history.updates.next(revision)
}

function didNext(history, revision, payload) {
  revision.meta.status = NEXT
  revision.payload = payload
  history.updates.next(revision)
}

function didComplete(history, revision) {
  revision.meta.status = COMPLETE
  revision.meta.closed = true
  history.updates.next(revision)
  history.archive()
}

function didError(history, revision, error) {
  revision.error = true
  revision.payload = error
  revision.meta.status = ERROR
  revision.meta.closed = true
  history.updates.next(revision)
  history.archive()
}

export default History
