/**
 * @fileoverview Leaf nodes of the comparison tree are queries. A
 * grouping of data subscriptions.
 * @flow
 */

import Emitter from '../emitter'
import { get } from '../utils'
import { getKeyPaths, getKeyStrings, type KeyPath } from '../key-path'

class Query extends Emitter {
  id: string
  keyPaths: KeyPath[]
  size: number
  params: any[]

  static getId(keyPaths: string | KeyPath[]) {
    return 'query:' + getKeyStrings(getKeyPaths(keyPaths))
  }

  constructor(id: string, keys: KeyPath[]) {
    super()

    this.id = id
    this.keyPaths = keys
    this.size = keys.length
  }

  trigger(state: Object) {
    let args = Array(this.size + 1)

    args[0] = 'change'

    for (var i = 0; i < this.size; i++) {
      args[i + 1] = get(state, this.keyPaths[i])
    }

    this._emit(...args)
  }

  isAlone() {
    return this._events.length <= 0
  }
}

export default Query
