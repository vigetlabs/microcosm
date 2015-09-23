/**
 * Send
 * Communicate an action to a store. This is how Microcosm determines
 * how transaction parameters should update state.
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
