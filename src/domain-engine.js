import MetaDomain from './meta-domain'
import getRegistration from './get-registration'

import {
  get,
  set,
  has,
  createOrClone
} from './utils'

import {
  castPath
} from './key-path'

export default class DomainEngine {

  constructor (repo) {
    this._repo = repo
    this._domains = []
    this._registry = {}

    // All realms contain a meta domain for basic Microcosm operations
    this.add([], MetaDomain)
  }

  _getHandlers ({ command, status }) {
    let handlers = []

    for (var i = 0, len = this._domains.length; i < len; i++) {
      var [key, domain] = this._domains[i]

      if (domain.register) {
        var handler = getRegistration(domain.register(), command, status)

        if (handler) {
          handlers.push({ key, domain, handler })
        }
      }
    }

    return handlers
  }

  register (task) {
    let type = task.type

    if (typeof this._registry[type] === 'undefined') {
      this._registry[type] = this._getHandlers(task)
    }

    return this._registry[type]
  }

  add (key, config, options) {
    let domain = createOrClone(config, options, this._repo)

    this._domains.push([castPath(key), domain])

    // Reset the registry
    this._registry = {}

    if (domain.setup) {
      domain.setup(this._repo, options)
    }

    return domain
  }

  reduce (fn, state, scope) {
    let next = state

    // Important: start at 1 to avoid the meta domain
    for (var i = 1, len = this._domains.length; i < len; i++) {
      let [ key, domain ] = this._domains[i]

      next = fn.call(scope, next, key, domain)
    }

    return next
  }

  sanitize (data) {
    let next = {}

    for (var i = 0, len = this._domains.length; i < len; i++) {
      let [key] = this._domains[i]

      if (key.length && has(data, key)) {
        next = set(next, key, get(data, key))
      }
    }

    return next
  }

  dispatch (state, task) {
    let handlers = this.register(task)

    for (var i = 0, len = handlers.length; i < len; i++) {
      var { key, domain, handler } = handlers[i]

      var last = get(state, key)
      var next = handler.call(domain, last, task.payload)

      state = set(state, key, next)
    }

    return state
  }

  deserialize (payload) {
    return this.reduce(function (memo, key, domain) {
      if (domain.deserialize) {
        return set(memo, key, domain.deserialize(get(payload, key)))
      }

      return memo
    }, payload)
  }

  serialize (state, payload) {
    return this.reduce(function (memo, key, domain) {
      if (domain.serialize) {
        return set(memo, key, domain.serialize(get(state, key)))
      }

      return memo
    }, payload)
  }

  teardown () {
    for (var i = 0, len = this._domains.length; i < len; i++) {
      let [key, domain] = this._domains[i]

      if (domain.teardown) {
        domain.teardown(this._repo)
      }
    }
  }

}
