import MetaDomain from './meta-domain'
import getRegistration from './get-registration'

import { get, set, createOrClone } from './utils'

import { castPath } from './key-path'

export default function DomainEngine(repo) {
  this.repo = repo
  this.domains = []
  this.registry = {}

  // All realms contain a meta domain for basic Microcosm operations
  this.add([], MetaDomain)
}

DomainEngine.prototype = {
  getHandlers({ command, status }) {
    let handlers = []

    for (var i = 0, len = this.domains.length; i < len; i++) {
      var [key, domain] = this.domains[i]

      if (domain.register) {
        var handler = getRegistration(domain.register(), command, status)

        if (handler) {
          handlers.push({ key, domain, handler })
        }
      }
    }

    return handlers
  },

  register(action) {
    let type = action.type

    if (!this.registry[type]) {
      this.registry[type] = this.getHandlers(action)
    }

    return this.registry[type]
  },

  add(key, config, options) {
    let domain = createOrClone(config, options, this.repo)

    this.domains.push([castPath(key), domain])

    // Reset the registry
    this.registry = {}

    if (domain.setup) {
      domain.setup(this.repo, options)
    }

    if (domain.teardown) {
      this.repo.on('teardown', domain.teardown, domain)
    }

    return domain
  },

  reduce(fn, state, scope) {
    let next = state

    // Important: start at 1 to avoid the meta domain
    for (var i = 1, len = this.domains.length; i < len; i++) {
      let [key, domain] = this.domains[i]

      next = fn.call(scope, next, key, domain)
    }

    return next
  },

  sanitize(data) {
    let next = {}

    for (var i = 0, len = this.domains.length; i < len; i++) {
      let [key] = this.domains[i]

      if (key.length) {
        next = set(next, key, get(data, key))
      }
    }

    return next
  },

  dispatch(state, action) {
    let handlers = this.register(action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      var { key, domain, handler } = handlers[i]

      var last = get(state, key)
      var next = handler.call(domain, last, action.payload)

      state = set(state, key, next)
    }

    return state
  },

  deserialize(payload) {
    return this.reduce(function(memo, key, domain) {
      if (domain.deserialize) {
        return set(memo, key, domain.deserialize(get(payload, key)))
      }

      return memo
    }, payload)
  },

  serialize(state, payload) {
    return this.reduce(function(memo, key, domain) {
      if (domain.serialize) {
        return set(memo, key, domain.serialize(get(state, key)))
      }

      return memo
    }, payload)
  }
}
