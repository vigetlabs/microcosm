/**
 * @flow
 */

import { isPlainObject } from './utils'
import { COMPLETE } from './status'

const NO_HANDLERS = []

export default function getRegistration(pool: Object, action: Action): *[] {
  let entry = pool[action.command] || NO_HANDLERS

  if (isPlainObject(entry)) {
    entry = entry[action.status] || NO_HANDLERS
  } else if (action.status !== COMPLETE) {
    return NO_HANDLERS
  }

  return Array.isArray(entry) ? entry : [entry]
}
