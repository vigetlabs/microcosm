/**
 * Send
 * Communicate an action to stores.
 */

let { MAPPING } = require('./lifecycle')

module.exports = function send (store, type, subset, payload, state) {
  let handler   = undefined
  let lifecycle = MAPPING[type]

  if (lifecycle && lifecycle in store) {
    handler = store[lifecycle]
  } else if (typeof store.register === 'function') {
    handler = store.register()[type]
  }

  return typeof handler === 'function' ? handler.call(store, subset, payload, state) : handler
}
