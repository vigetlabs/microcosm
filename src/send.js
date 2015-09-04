/**
 * Send
 * Communicate an action to stores
 */
module.exports = function send (store, state, { payload, type }) {
  if (type in store) {
    return store[type].call(store, state, payload)
  }

  let pool = typeof store.register === 'function' ? store.register() : false

  if (!pool || type in pool === false) {
    return state
  }

  let handler = pool[type]

  return typeof handler === 'function' ? handler.call(store, state, payload) : handler
}
