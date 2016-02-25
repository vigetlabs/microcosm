/**
 * Dispatch takes an existing state and performs the result of a transaction
 * on top of it. This is different than other Flux implementations.
 *
 * Dispatch answers the question:
 * "What will change when I account for a transaction?"
 */

import { get, set } from './update'

export default function dispatch (state, handlers, payload) {
  for (var i = 0, size = handlers.length; i < size; i++) {
    let { key, store, handler } = handlers[i]

    let answer = typeof handler === 'function' ? handler.call(store, get(state, key), payload, state) : handler

    if (answer !== undefined) {
      state = set(state, key, answer)
    }
  }

  return state
}
