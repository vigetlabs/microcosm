import { tag } from 'microcosm'

const MISSING = { age: Infinity, value: null }

function tokenize(action, params) {
  let key = `${tag(action)}`
  let args = ''

  for (let field in params) {
    args += `${field}: ${params[field]}`
  }

  return `${key}(${args})`
}

export class CacheEntry {
  constructor(action, params, value) {
    this._key = tokenize(action, params)
    this._birth = Date.now()
    this._value = value
  }

  get age() {
    return Date.now() - this._birth
  }

  valueOf() {
    return this._value
  }

  toString() {
    return this._key
  }
}

export class Cache {
  constructor() {
    this._cache = {}
  }

  set(action, params, value) {
    this._cache[tokenize(action, params)] = new CacheEntry(
      action,
      params,
      value
    )
  }

  get(action, params) {
    let token = tokenize(action, params)

    if (this._cache.hasOwnProperty(token)) {
      return this._cache[token]
    }

    return MISSING
  }
}
