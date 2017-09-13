/**
 * @fileoverview Leaf nodes of the comparison tree are queries. A
 * grouping of data subscriptions.
 * @flow
 */

import Emitter from '../emitter'
import { get } from '../utils'
import { getKeyStrings, type KeyPath } from '../key-path'

class Query extends Emitter {
  id: string
  keyPaths: KeyPath[]

  static getId(keyPaths: KeyPath[]) {
    return 'query:' + getKeyStrings(keyPaths)
  }

  constructor(id: string, keys: KeyPath[]) {
    super()

    this.id = id
    this.keyPaths = keys
  }

  trigger(state: Object) {
    let args = ['change']

    for (var i = 0, len = this.keyPaths.length; i < len; i++) {
      args[i + 1] = get(state, this.keyPaths[i])
    }

    this._emit(...args)
  }

  isAlone() {
    return this._events.length <= 0
  }
}

export default Query
