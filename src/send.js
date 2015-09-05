/**
 * Send
 * Communicate an action to stores
 */

let { mapping } = require('./lifecycle')

function call(fn, scope, state, payload) {
  return typeof fn === 'function' ? fn.call(scope, state, payload) : fn
}

module.exports = function send (store, state, { payload, type }) {
  let lifecycle = mapping[type]

  if (lifecycle && lifecycle in store) {
    return call(store[lifecycle], store, state, payload)
  }

  let handlers = typeof store.register === 'function' ? store.register() : false

  if (!handlers || type in handlers === false) {
    return state
  }
  return call(handlers[type], store, state, payload)
}
