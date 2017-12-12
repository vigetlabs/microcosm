/**
 * @flow
 */

import { isPlainObject } from './utils'
import { COMPLETE } from './lifecycle'
import { result } from './utils'

const NO_HANDLERS = []

export function getHandlers(pool: Object, action: Action): *[] {
  let { status, command } = action.meta

  let entry = pool[command] || NO_HANDLERS

  if (isPlainObject(entry)) {
    entry = entry[status] || NO_HANDLERS
  } else if (status !== COMPLETE) {
    return NO_HANDLERS
  }

  return Array.isArray(entry) ? entry : [entry]
}

export function map(repo, entity) {
  return action => {
    let pool = result(entity, 'register')
    let handlers = getHandlers(pool, action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      handlers[i].call(entity, repo, action.payload)
    }
  }
}

export function teardown(repo, entity, options) {
  if ('teardown' in entity) {
    entity.teardown(repo, options)
  }
}

export function setup(repo, entity, options) {
  if ('setup' in entity) {
    entity.setup(repo, options)
  }
}
