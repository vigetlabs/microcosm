/**
 * @fileoverview Leaf nodes of the comparison tree are queries. A
 * grouping of data subscriptions.
 * @flow
 */

import Emitter from '../emitter'
import { get } from '../utils'
import { getKeyPaths, getKeyStrings, type KeyPath } from '../key-path'

class Query extends Emitter {
  static getId(keyPaths: string | Array<KeyPath>) {
    return 'query:' + getKeyStrings(getKeyPaths(keyPaths))
  }

  id: string
  keyPaths: Array<KeyPath>

  constructor(id: string, keys: string | Array<KeyPath>) {
    super()

    this.id = id
    this.keyPaths = getKeyPaths(keys)
  }

  forEachPath(callback: Function, scope?: *) {
    let paths = this.keyPaths

    for (var i = 0, len = paths.length; i < len; i++) {
      callback.call(scope, paths[i], this)
    }
  }

  extract(state: Object) {
    let length = this.keyPaths.length
    let values = Array(length)

    for (var i = 0; i < length; i++) {
      values[i] = get(state, this.keyPaths[i])
    }

    return values
  }

  trigger(state: Object) {
    let values = this.extract(state)

    this._emit('change', ...values)
  }

  isAlone() {
    return this._events.length <= 0
  }
}

export default Query
