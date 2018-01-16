// @flow

import { EMPTY_ARRAY, EMPTY_OBJECT } from './empty'

function wrap(value: *): *[] {
  return Array.isArray(value) ? value : [value]
}

export function spawn(target: any, options: ?Object, repo: *) {
  return typeof target === 'function'
    ? new target(options, repo)
    : Object.create(target)
}

function buildRegistry(entity: *, tag: string): Object {
  if (!entity.register) {
    return EMPTY_OBJECT
  }

  let handlers = entity.register()[tag] || EMPTY_OBJECT

  if (Array.isArray(handlers) || typeof handlers === 'function') {
    return { complete: handlers }
  }

  return handlers
}

export class Cache {
  constructor(entity, seed) {
    this._entity = entity
    this._entries = seed || {}
  }

  register(action) {
    let { tag } = action.meta

    if (!this._entries.hasOwnProperty(tag)) {
      this._entries[tag] = buildRegistry(this._entity, tag)
    }

    return this._entries[tag]
  }

  respondsTo(action) {
    return this.register(action) !== EMPTY_OBJECT
  }

  resolve(action) {
    return wrap(this.register(action)[action.meta.status] || EMPTY_ARRAY)
  }
}
