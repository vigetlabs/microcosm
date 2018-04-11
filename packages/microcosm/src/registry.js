// @flow

import { type Subject } from './subject'
import { EMPTY_ARRAY, EMPTY_OBJECT } from './empty'
import { type Domain } from './domain'
import { type Effect } from './effect'

function buildRegistry(entity: Domain<*> | Effect, key: string): Object {
  let handlers = entity.register()[key] || EMPTY_OBJECT

  if (Array.isArray(handlers) || typeof handlers === 'function') {
    return { complete: handlers }
  }

  return handlers
}

export class Registry {
  _entity: *
  _entries: *

  constructor(entity: Domain<*> | Effect) {
    this._entity = entity
    this._entries = {}
  }

  resolve(action: Subject): Function[] {
    let key = action.toString()

    if (!this._entries.hasOwnProperty(key)) {
      this._entries[key] = buildRegistry(this._entity, key)
    }

    let handlers = this._entries[key][action.status] || EMPTY_ARRAY

    return Array.isArray(handlers) ? handlers : [handlers]
  }
}
