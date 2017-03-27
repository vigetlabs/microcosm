import Emitter from '../emitter'
import {get} from '../utils'

import {
  getKeyPaths,
  getKeyStrings
} from '../key-path'

export default class Query extends Emitter {

  constructor (id, keys) {
    super()

    this.id = id
    this.keyPaths = getKeyPaths(keys)
  }

  static getId (keyPaths) {
    return 'query:' + getKeyStrings(getKeyPaths(keyPaths))
  }

  extract (state) {
    let length = this.keyPaths.length
    let values = Array(length)

    for (var i = 0; i < length; i++) {
      values[i] = get(state, this.keyPaths[i])
    }

    return values
  }

  trigger (state) {
    this._emit('change', ...this.extract(state))
  }

  isEmpty () {
    return this._events.length <= 0
  }

}
