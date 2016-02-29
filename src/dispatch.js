/**
 * Dispatch takes an existing state and performs the result of a transaction
 * on top of it. This is different than other Flux implementations.
 *
 * Dispatch answers the question:
 * "What will change when I account for a transaction?"
 */

import merge from './merge'

function get (target, key) {
  return key == null ? target : target[key]
}

function set (target, key, value) {
  if (key == null) return value

  target[key] = value

  return target
}

export default function dispatch (state, handlers, payload) {
  if (handlers.length <= 0) return state

  let next = merge({}, state)

  for (var i = 0, size = handlers.length; i < size; i++) {
    let { key, store, handler } = handlers[i]

    let answer = typeof handler === 'function' ? handler.call(store, get(next, key), payload, next) : handler

    if (answer !== undefined) {
      next = set(next, key, answer)
    }
  }

  return next
}
