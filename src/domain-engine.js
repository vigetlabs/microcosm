import MetaDomain from './meta-domain'
import getRegistration from './get-registration'
import { get, set, createOrClone } from './utils'
import { castPath, getKeyString } from './key-path'

class DomainEngine {
  /**
   * @param {Microcosm} repo
   */
  constructor(repo) {
    this.registry = {}
    this.repo = repo
    this.domains = []

    // All realms contain a meta domain for basic Microcosm operations
    this.add([], MetaDomain)
  }

  getRepoHandlers(action) {
    let { command, status } = action

    let handler = getRegistration(this.repo.register(), command, status)

    return handler ? [{ key: [], domain: this.repo, handler }] : []
  }

  getHandlers(action) {
    let handlers = this.getRepoHandlers(action)

    let { command, status } = action

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
  }

  register(action) {
    let type = action.type

    if (!this.registry[type]) {
      this.registry[type] = this.getHandlers(action)
    }

    return this.registry[type]
  }

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
  }

  reduce(fn, state, scope) {
    let next = state

    // Important: start at 1 to avoid the meta domain
    for (var i = 1, len = this.domains.length; i < len; i++) {
      let [key, domain] = this.domains[i]

      next = fn.call(scope, next, key, domain)
    }

    return next
  }

  supportsKey(key) {
    if (key in this.repo.state) {
      return true
    }

    return this.domains.some(entry => getKeyString(entry[0]) === key)
  }

  sanitize(data) {
    let repo = this.repo
    let parent = repo.parent
    let next = {}

    for (var key in data) {
      if (parent && parent.domains.supportsKey(key)) {
        continue
      }

      if (this.supportsKey(key)) {
        next[key] = data[key]
      }
    }

    return next
  }

  dispatch(state, action) {
    let handlers = this.register(action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      var { key, domain, handler } = handlers[i]

      var last = get(state, key)
      var next = handler.call(domain, last, action.payload)

      state = set(state, key, next)
    }

    return state
  }

  deserialize(payload) {
    return this.reduce(function(memo, key, domain) {
      if (domain.deserialize) {
        return set(memo, key, domain.deserialize(get(payload, key)))
      }

      return memo
    }, payload)
  }

  serialize(state, payload) {
    return this.reduce(function(memo, key, domain) {
      if (domain.serialize) {
        return set(memo, key, domain.serialize(get(state, key)))
      }

      return memo
    }, payload)
  }
}

export default DomainEngine
