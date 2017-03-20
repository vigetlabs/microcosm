import Emitter from '../emitter'

import {
  get,
  inherit
} from '../utils'

import {
  getKeyPaths
} from './key-path'

export default function Query (id, keys) {
  Emitter.call(this)

  this.revision = -1
  this.id = id
  this.keys = getKeyPaths(keys)
}

inherit(Query, Emitter, {
  extract (state) {
    let len = this.keys.length
    let values = Array(len)

    for (var i = 0; i < len; i++) {
      values[i] = get(state, this.keys[i])
    }

    return values
  },

  trigger (state) {
    let values = this.extract(state)

    this._emit('change', ...values)
  }
})
