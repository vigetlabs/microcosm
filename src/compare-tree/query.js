import Emitter from '../emitter'
import { get } from '../utils'
import { getKeyPaths, getKeyStrings } from '../key-path'

/**
 * @fileoverview Leaf nodes of the comparison tree are queries. A
 * grouping of data subscriptions.
 */
class Query extends Emitter {
  static getId(keyPaths) {
    return 'query:' + getKeyStrings(getKeyPaths(keyPaths))
  }

  constructor(id, keys) {
    super()

    this.id = id
    this.keyPaths = getKeyPaths(keys)
  }

  forEachPath(callback, scope) {
    let paths = this.keyPaths

    for (var i = 0, len = paths.length; i < len; i++) {
      callback.call(scope, paths[i], this)
    }
  }

  extract(state) {
    let length = this.keyPaths.length
    let values = Array(length)

    for (var i = 0; i < length; i++) {
      values[i] = get(state, this.keyPaths[i])
    }

    return values
  }

  trigger(state) {
    let values = this.extract(state)

    this._emit('change', ...values)
  }

  isAlone() {
    return this._events.length <= 0
  }
}

export default Query
