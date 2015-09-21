/**
 * Send
 * Communicate an action to stores
 */

let { MAPPING } = require('./lifecycle')

function call(fn, scope, key, state, payload) {
  return typeof fn === 'function' ? fn.call(scope, state[key], payload, state) : fn
}

module.exports = function send (store, key, state, { payload, type }) {
  let lifecycle = MAPPING[type]

  if (lifecycle && lifecycle in store) {
    return call(store[lifecycle], store, key, state, payload)
  }

  let handlers = typeof store.register === 'function' ? store.register() : false

  if (!handlers || type in handlers === false) {
    return state[key]
  }

  return call(handlers[type], store, key, state, payload)
}
