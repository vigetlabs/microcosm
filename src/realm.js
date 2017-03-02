import MetaDomain from './meta-domain'
import getDomainHandlers from './get-domain-handlers'

import {
  get,
  set,
  castPath,
  createOrClone
} from './utils'

export default function Realm (repo) {
  this.repo = repo
  this.domains = []
  this.registry = {}

  // All realms contain a meta domain for basic Microcosm operations
  this.meta = this.add(null, MetaDomain)
}

Realm.prototype = {

  register (action) {
    let type = action.command[action.status]

    if (typeof this.registry[type] === 'undefined') {
      this.registry[type] = getDomainHandlers(this.domains, action)
    }

    return this.registry[type]
  },

  add (key, config, options) {
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

  reduce (fn, state, scope) {
    let next = state

    // Important: start at 1 to avoid the meta domain
    for (var i = 1, len = this.domains.length; i < len; i++) {
      let [ key, domain ] = this.domains[i]

      next = fn.call(scope, next, key, domain)
    }

    return next
  },

  invoke (method, state, seed) {
    return this.reduce(function (memo, key, domain) {
      if (domain[method]) {
        return set(memo, key, domain[method](get(state, key)))
      }

      return memo
    }, seed)
  },

  prune (state, data) {
    return this.reduce(function (next, key) {
      let value = get(data, key)

      return value === undefined ? next : set(next, key, value)
    }, state)
  }

}
