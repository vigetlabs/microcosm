import { get, set } from './update'

const EMPTY = {}

export default function Store (options) {
  if (typeof options === 'function') {
    options = { register: options }
  }

  Object.assign(this, options)
}

Store.prototype = {
  receive(state, type, payload, key) {
    const handler = this[type] || this.register()[type]

    if (handler == undefined) {
      return state
    }

    return set(state, key, handler.call(this, get(state, key), payload))
  },

  register() {
    return EMPTY
  }
}
