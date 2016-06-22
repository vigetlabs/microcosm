/**
 * Dispatch takes an existing state and performs the result of a transaction
 * on top of it. This is different than other Flux implementations.
 *
 * Dispatch answers the question:
 * "What will change when I account for a action?"
 */

function get (target, key) {
  return key == null ? target : target[key]
}

function set (target, key, value) {
  if (key == null) return value

  if (target && target[key] === value) {
    return target
  }

  return Object.assign({}, target, { [key] : value })
}

export default function dispatch (state, handlers, payload, params) {
  if (handlers.length <= 0) return state

  let next = Object.assign({}, state)

  for (var i = 0, size = handlers.length; i < size; i++) {
    let { key, store, handler } = handlers[i]

    let answer = typeof handler === 'function' ? handler.call(store, get(next, key), payload, params) : handler

    if (answer !== undefined) {
      next = set(next, key, answer)
    }
  }

  return next
}
