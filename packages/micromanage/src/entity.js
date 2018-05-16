import axios from 'axios'
import assert from 'assert'
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
      return Object.keys(property.properties).reduce((memo, next) => {
        memo[next] = useDefault(next, property.properties[next])
        return memo
      }, {})
    case 'string':
      return ''
  }

  assert(
    false,
    `Unrecognized type "${property.type}" for property "${key}".` +
      `Please use a recognized type or provide a default value.`
  )

  return null
}

function parameterize(path, params) {
  return path.replace(/\{(.+?)\}/g, (_, match) => {
    assert(match in params, `Expected parameter ${match} in params.`)
    return params[match]
  })
}

export function Entity(options) {
  assert(options, 'Please provide a valid schema')

  let schema = merge({ type: 'object', required: [] }, options)
  let request = axios.create({ baseURL: schema.base })

  let links = schema.links || []
  let showUrl = { href: null }
  let indexUrl = { href: null }

  links.forEach(link => {
    switch (link.rel) {
      case 'self':
        showUrl = link
        break
      case 'index':
        indexUrl = link
        break
      default:
      // Do nothing
    }
  })

  function parse(response) {
    return {
      data: response.data,
      request: response.config,
      response: response
    }
  }

  class EntityDefinition {
    static schema = schema
    static request = request

    static url(params = {}) {
      let link = 'id' in params ? showUrl : indexUrl

      return parameterize(link.href, params)
    }

    static index(params) {
      let url = parameterize(indexUrl.href, params)

      return request.get(url, { params }).then(parse)
    }

    static show(params) {
      let url = parameterize(showUrl.href, params)

      return request.get(url).then(parse)
    }

    static create(params) {
      let url = parameterize(showUrl.href, params)

      return request.post(url, params).then(parse)
    }

    static update(params) {
      let url = parameterize(showUrl.href, params)

      return request.patch(url, params).then(parse)
    }

    static destroy(id) {
      let url = parameterize(showUrl.href, { id })

      return request.delete(url).then(response => {
        return { data: id, response }
      })
    }

    constructor(params = {}, age = Date.now()) {
      this._params = params
      this._age = age
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

    toJSON() {
      return this._params
    }
  }

  Object.keys(schema.properties).forEach(key => {
    var prop = schema.properties[key]
    var defaultValue = useDefault(key, prop)

    Object.defineProperty(EntityDefinition.prototype, key, {
      get() {
        let value = this._params[key] == null ? defaultValue : this._params[key]

        switch (prop.type) {
          case 'string':
            return '' + value
          case 'boolean':
            return !!value
          default:
            return value
        }
      }
    })
  })

  return EntityDefinition
}
