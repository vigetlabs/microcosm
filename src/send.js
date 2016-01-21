/**
 * Send
 * Communicate an action to a store. This is how Microcosm determines
 * how transaction parameters should update state.
 */

import { formatTag } from './tag'
import { isFunction } from './type-checks'
import { get } from './update'

export default function send (key, store, state, type, payload) {
  let handler = store[type]

  if (handler === undefined && store.register) {
    let registrations = store.register()

    if (process.env.NODE_ENV !== 'production' && type in registrations && registrations[type] === undefined) {
      console.warn(`Store for ${ key } is registered to the action ${ formatTag(type) }, but the handler is undefined!`)
    }

    handler = registrations[type]
  }

  return isFunction(handler) ? handler.call(store, get(state, key), payload, state) : handler
}
