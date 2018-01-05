// @flow

import { EMPTY_ARRAY, EMPTY_OBJECT } from './empty'
import { COMPLETE } from './lifecycle'

function wrap(value: *): *[] {
  return Array.isArray(value) ? value : [value]
}

export function spawn(target: any, options: ?Object, repo: *) {
  return typeof target === 'function'
    ? new target(options, repo)
    : Object.create(target)
}

export function buildRegistry(entity: *): Object {
  return entity.register ? entity.register() : EMPTY_OBJECT
}

export function getHandlers(pool: Object, action: Action): *[] {
  let entry = pool[action.tag]

  if (entry) {
    if (typeof entry !== 'function') {
      if (action.status in entry) {
        return wrap(entry[action.status])
      }
    } else if (action.status === COMPLETE) {
      return wrap(entry)
    }
  }

  return EMPTY_ARRAY
}

export function cache(entity) {
  let registry = new Map()

  return action => {
    if (registry.has(action.tag) === false) {
      registry.set(action.tag, buildRegistry(entity))
    }

    return getHandlers(registry.get(action.tag), action)
  }
}

export function map(repo, entity) {
  let registry = cache(entity)

  return action => {
    let handlers = registry(action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      handlers[i].call(entity, repo, action.payload)
    }
  }
}

export function teardown(repo, entity, options) {
  return () => {
    if ('teardown' in entity) {
      entity.teardown(repo, options)
    }
  }
}

export function setup(repo, entity, options) {
  return () => {
    if ('setup' in entity) {
      entity.setup(repo, options)
    }
  }
}
