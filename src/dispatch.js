/**
 * Dispatch takes an existing state and performs the result of a transaction
 * on top of it. This is different than other Flux implementations.
 *
 * Dispatch answers the question:
 * "What will change when I account for a transaction?"
 */

let send = require('./send')

module.exports = function dispatch(stores, state, { active, payload, type }) {
  for (var i = 0, len = stores.length; active && i < len; i++) {
    var [ key, store ] = stores[i]

    let answer = send(store, type, state[key], payload, state)

    if (answer !== void 0) {
      state[key] = answer
    }
  }

  return state
}
