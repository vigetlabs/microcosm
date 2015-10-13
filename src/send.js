/**
 * Send
 * Communicate an action to a store. This is how Microcosm determines
 * how transaction parameters should update state.
 */

import { isFunction } from './type-checks'

export default function (store, type, subset, payload, state) {
  let handler = store[type]

  if (handler === undefined && store.register) {
    handler = store.register()[type]
  }

  return isFunction(handler) ? handler.call(store, subset, payload, state) : handler
}
