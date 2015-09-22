/**
 * Dispatch takes an existing state and performs the result of a transaction
 * on top of it. This is different than other Flux implementations, there
 * are no side-effects.
 *
 * Dispatch answers the question:
 * "What will change when I account for a transaction?"
 */

let send = require('./send')

module.exports = function dispatch(stores, state, transaction) {
  let next = Object.assign({}, state)

  for (var i = 0; i < stores.length; i++) {
    var key   = stores[i][0]
    var store = stores[i][1]
    var answer = send(store, key, next, transaction)

    if (answer !== void 0) {
      next[key] = answer
    }
  }

  return next
}
