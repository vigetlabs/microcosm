import assert from 'assert'
import { errors, nameOf } from './strings'
import { merge } from 'microcosm'

function useDefault(key, property) {
  if ('default' in property) {
    return property.default
  }

  switch (property.type) {
    case 'array':
      return []
    case 'boolean':
      return false
    case 'null':
      return null
    case 'number':
      return 0
    case 'object':
      return {}
    case 'string':
      return ''
  }

  assert(false, errors.noDefault(key))

  return null
}

export class Entity {
  static schema = {}

  constructor(params = {}) {
    let schema = this.constructor.schema

    this._params = params

    for (var key in schema.properties) {
      var prop = schema.properties[key]

      assert(prop.type != null, errors.noType(nameOf(this), key))

      this[key] = params[key] == null ? useDefault(key, prop) : params[key]
    }

    this._id = params.id
  }

  update(params) {
    return new this.constructor(merge(this._params, params))
  }
}
