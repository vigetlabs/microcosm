/**
 * @flow
 */

import { Observable } from './observable'
import Subject from './subject'
import coroutine from './coroutine'
import tag from './tag'
import { uid } from './utils'

class History {
  _root: Action
  _head: Action

  constructor() {
    this._downstream = new Map()
    this._upstream = new Map()

    this.releases = new Subject()
    this.updates = new Subject()
  }

  then(pass?: *, fail?: *): Promise<*> {
    return Observable.of(...this._downstream.values()).then(pass, fail)
  }

  append(command: string | Command, params: *[], origin: Microcosm): Action {
    command = tag(command)

    let id = uid(command + '-')

    if (this.head) {
      this._downstream.set(this.head, id)
      this._upstream.set(id, this.head)
    } else {
      this.root = id
    }

    this.head = id

    let action = new Subject()

    this.updates.next({ id, action, command: command.toString() })

    coroutine(action, command, params, origin)

    return action
  }

  before(id) {
    return this._upstream.get(id)
  }

  after(id) {
    return this._downstream.get(id)
  }

  end(id) {
    return id === this.head
  }
}

export default History
