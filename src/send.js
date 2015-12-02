/**
 * Send
 * Communicate an action to a store. This is how Microcosm determines
 * how transaction parameters should update state.
 */

import { isFunction } from './type-checks'
import { get } from './update'

export default function send (key, store, state, type, payload) {
  let handler = store[type]

  if (handler === undefined && store.register) {
    handler = store.register()[type]
  }

  return isFunction(handler) ? handler.call(store, get(state, key), payload, state) : handler
}
