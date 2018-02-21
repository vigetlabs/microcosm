// @flow

import { type Subject } from './subject'
import { EMPTY_ARRAY, EMPTY_OBJECT } from './empty'
import { type Domain } from './domain'
import { type Effect } from './effect'

function buildRegistry(entity: Domain<*> | Effect, tag: string): Object {
  let handlers = entity.register()[tag] || EMPTY_OBJECT

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
    let tag = action.toString()

    if (!this._entries.hasOwnProperty(tag)) {
      this._entries[tag] = buildRegistry(this._entity, tag)
    }

    let handlers = this._entries[tag][action.status] || EMPTY_ARRAY

    return Array.isArray(handlers) ? handlers : [handlers]
  }
}
