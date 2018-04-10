import assert from 'assert'
import { errors, nameOf } from './strings'
import { merge } from 'microcosm'

let uid = 0

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
    let proto = this.constructor.prototype

    this._params = params

    for (var key in schema.properties) {
      var prop = schema.properties[key]

      assert(prop.type != null, errors.noType(nameOf(this), key))

      this._params[key] =
        params[key] == null ? useDefault(key, prop) : params[key]

      /** @todo Is this slow? **/
      if (proto.hasOwnProperty(key) === false) {
        Object.defineProperty(proto, key, {
          get() {
            return this._params[key]
          },
          set() {
            throw new Error("Do not directly modify Entities. Instead use update().")
          }
        })
      }
    }

    this._id = params.id
  }

  update(params) {
    let next = merge(this._params, params)

    if (next === this._params) {
      return this
    }

    return new this.constructor(next)
  }
}
