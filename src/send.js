/**
 * Send
 * Communicate an action to a store. This is how Microcosm determines
 * how transaction parameters should update state.
 */

var lifecycle = require('./lifecycle')

module.exports = function send (store, type, subset, payload, state) {
  let handler = store[type]

  if (handler === undefined && store.register) {
    handler = store.register()[type]
  }

  return typeof handler === 'function' ? handler.call(store, subset, payload, state) : handler
}
