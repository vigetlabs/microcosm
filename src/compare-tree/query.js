import Emitter from '../emitter'

import { get, inherit } from '../utils'

import { getKeyPaths, getKeyStrings } from '../key-path'

export default function Query (id, keys) {
  Emitter.call(this)

  this.id = id
  this.keyPaths = getKeyPaths(keys)
}

Query.getId = function (keyPaths) {
  return 'query:' + getKeyStrings(getKeyPaths(keyPaths))
}

inherit(Query, Emitter, {
  extract (state) {
    let length = this.keyPaths.length
    let values = Array(length)

    for (var i = 0; i < length; i++) {
      values[i] = get(state, this.keyPaths[i])
    }

    return values
  },

  trigger (state) {
    let values = this.extract(state)

    this._emit('change', ...values)
  },

  isAlone () {
    return this._events.length <= 0
  }
})
