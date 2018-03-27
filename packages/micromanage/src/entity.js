import assert from 'assert'
import { errors, nameOf } from './strings'

export class Entity {
  static schema = {}

  constructor(params) {
    assert(
      this.constructor.hasOwnProperty('schema'),
      errors.noSchema(nameOf(this))
    )

    for (var key in this.constructor.schema) {
      if (params.hasOwnProperty(key)) {
        this._assign(key, params[key])
      }
    }
  }

  _assign(key, value) {
    let type = this.constructor.schema[key]

    assert(value != null, errors.nullType(nameOf(this), nameOf(type), key))

    assert(
      Object.getPrototypeOf(value) === type.prototype,
      errors.wrongType(nameOf(this), nameOf(type), key, nameOf(value))
    )

    this[key] = value
  }
}
