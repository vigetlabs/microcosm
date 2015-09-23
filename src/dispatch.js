/**
 * Dispatch takes an existing state and performs the result of a transaction
 * on top of it. This is different than other Flux implementations, there
 * are no side-effects.
 *
 * Dispatch answers the question:
 * "What will change when I account for a transaction?"
 */

let send = require('./send')

function fold(transaction) {
  let { type, payload } = transaction

  return function (state, config) {
    let key    = config[0]
    let store  = config[1]
    let answer = send(store, type, state[key], payload, state)

    if (answer !== void 0) {
      state[key] = answer
    }

    return state
  }
}

module.exports = function dispatch(stores, state, transaction) {
  return stores.reduce(fold(transaction), Object.assign({}, state))
}
