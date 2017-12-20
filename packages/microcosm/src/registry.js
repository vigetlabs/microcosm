// @flow

import { EMPTY_ARRAY, EMPTY_OBJECT } from './empty'
import { COMPLETE } from './lifecycle'

function wrap(value: *): *[] {
  return Array.isArray(value) ? value : [value]
}

export function createOrClone(target: any, options: ?Object, repo: *) {
  return typeof target === 'function'
    ? new target(options, repo)
    : Object.create(target)
}

export function buildRegistry(entity: *): Object {
  if (typeof entity.register === 'function') {
    return entity.register()
  }

  return entity.register == null ? EMPTY_OBJECT : entity.register
}

export function getHandlers(pool: Object, action: Action): *[] {
  let entry = pool[action.tag]

  if (entry) {
    if (action.status in entry) {
      return wrap(entry[action.status])
    }

    if (action.status === COMPLETE) {
      return wrap(entry)
    }
  }

  return EMPTY_ARRAY
}

export function map(repo, entity) {
  return action => {
    let handlers = getHandlers(buildRegistry(entity), action)

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
