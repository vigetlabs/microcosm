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

export function Entity(options) {
  assert(options, 'Please provide a valid schema')

  let schema = merge({ type: 'object', required: [] }, options)

  class EntityDefinition {
    static schema = schema

    constructor(params = {}) {
      this._params = params
      this._age = Date.now()
    }

    get _identifier() {
      return this._params.id
    }

    get _type() {
      return schema.title
    }

    update(params) {
      return new this.constructor(merge(this._params, params))
    }
  }

  Object.keys(schema.properties).forEach(key => {
    var prop = schema.properties[key]
    var defaultValue = useDefault(key, prop)

    Object.defineProperty(EntityDefinition.prototype, key, {
      get() {
        return this._params[key] == null ? defaultValue : this._params[key]
      }
    })
  })

  return EntityDefinition
}
