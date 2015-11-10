/**
 * Dispatch takes an existing state and performs the result of a transaction
 * on top of it. This is different than other Flux implementations.
 *
 * Dispatch answers the question:
 * "What will change when I account for a transaction?"
 */

import send from './send'
import { set } from './update'

let dispatch = function (stores, state, { active, payload, type }) {
  for (var i = 0, len = stores.length; active && i < len; i++) {
    var [ key, store ] = stores[i]

    var answer = send(key, store, state, type, payload)

    if (answer !== undefined) {
      state = set(state, key, answer)
    }
  }

  return state
}

export default dispatch
