/**
 * @flow
 */

import { Observable } from './observable'
import Subject from './subject'
import coroutine from './coroutine'
import defaultUpdateStrategy from './default-update-strategy'
import tag from './tag'
import { merge, uid } from './utils'
import { type Updater } from './default-update-strategy'
import { iteratorTag } from './symbols'

type HistoryOptions = {
  batch?: boolean,
  debug?: boolean,
  maxHistory?: number,
  updater?: (options: Object) => Updater
}

export const DEFAULTS = {
  batch: false,
  debug: true,
  maxHistory: 1,
  updater: defaultUpdateStrategy
}

class History {
  size: number
  limit: number
  updater: (options: Object) => Updater
  releasing: boolean
  release: () => void
  head: Action
  root: Action

  constructor(config: HistoryOptions) {
    let options = merge(DEFAULTS, config)

    this._size = 0
    this._limit = Math.max(
      DEFAULTS.maxHistory,
      options.debug ? Infinity : options.maxHistory
    )
    this._updater = options.updater(options)
    this._releasing = false
    this._release = () => this._closeRelease()
    this._actions = {}
    this._downstream = {}
    this._upstream = {}

    this.releases = new Subject()
    this.updates = new Subject()

    this.updates.subscribe(this._queueRelease.bind(this))
  }

  then(pass?: *, fail?: *): Promise<*> {
    return Observable.of(Array.from(this)).then(pass, fail)
  }

  append(command: string | Command, params: *[], origin: Microcosm): Action {
    command = tag(command)

    let id = uid(command + '-')

    if (this.head) {
      this._downstream[this.head] = id
      this._upstream[id] = this.head
    } else {
      this.root = id
    }

    this.head = id
    this._size += 1

    let action = new Subject()

    this._actions[id] = action

    this.updates.next({ id, command, action })

    coroutine(action, command, params, origin)

    return action
  }

  before(id) {
    return this._actions[this._upstream[id]]
  }

  after(id) {
    return this._actions[this._downstream[id]]
  }

  end(id) {
    return id === this.head
  }

  /* Private ------------------------------------------------------ */

  // $FlowFixMe
  [iteratorTag](): Iterator<Action, void> {
    let cursor = this.root

    let iterator = {
      next: () => {
        var next = cursor

        if (next == null) {
          return { done: true }
        }

        cursor = this.end(next) ? null : this.after(next)

        return { value: next, done: false }
      }
    }

    return iterator
  }

  _queueRelease() {
    if (!this._releasing) {
      this._releasing = true
      this._updater(this._release)
    }
  }

  _closeRelease() {
    console.assert(
      this._releasing,
      'Close release should never be called when not releasing.'
    )

    this._releasing = false
    this.releases.next()
  }
}

export default History
