/**
 * Send
 * Communicate an action to stores
 */

let { mapping } = require('./lifecycle')

module.exports = function send (store, state, { payload, type }) {
  if (mapping[type] in store) {
    return store[mapping[type]].call(store, state, payload)
  }

  let pool = typeof store.register === 'function' ? store.register() : false

  if (!pool || type in pool === false) {
    return state
  }

  let handler = pool[type]

  return typeof handler === 'function' ? handler.call(store, state, payload) : handler
}
