// @flow

import { type Subject } from './subject'
import { EMPTY_ARRAY, EMPTY_OBJECT } from './empty'

function buildRegistry(entity: *, key: string): Object {
  let handlers = entity.register()[key] || EMPTY_OBJECT

  if (Array.isArray(handlers) || typeof handlers === 'function') {
    return { complete: handlers }
  }

  return handlers
}

export class Registry {
  _entity: *
  _entries: *

  constructor(entity: *) {
    this._entity = entity
    this._entries = {}
  }

  register(action: Subject) {
    let { key } = action.meta

    if (!this._entries.hasOwnProperty(key)) {
      this._entries[key] = buildRegistry(this._entity, key)
    }

    return this._entries[key]
  }

  respondsTo(action: Subject): boolean {
    return this.register(action) != EMPTY_OBJECT
  }

  resolve(action: Subject): Function[] {
    let handlers = this.register(action)[action.status] || EMPTY_ARRAY

    return Array.isArray(handlers) ? handlers : [handlers]
  }
}
