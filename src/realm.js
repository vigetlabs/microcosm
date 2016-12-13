/**
 * A cluster of domains. Mostly for ergonomics
 */

import getDomainHandlers from './getDomainHandlers'

export default function Realm (repo) {
  this.repo = repo
  this.domains = []
  this.registry = {}

  // Teardown all domains when the repo tears down
  this.repo.on('teardown', this.teardown, this)
}

Realm.prototype = {

  respondsTo(action) {
    return this.register(action.type).length > 0
  },

  register (type) {
    let handlers = this.registry[type]

    if (handlers == null) {
      handlers = this.registry[type] = getDomainHandlers(this.domains, type)
    }

    return handlers
  },

  add (key, config, options) {
    if (process.env.NODE_ENV !== 'production') {
      console.assert(key == null || typeof key === 'string',
                     'Domains must be mounted to a string key, or null for the root.',
                     'Instead got:', key)
    }

    let domain = null

    if (typeof config === 'function') {
      domain = new config(options)
    } else {
      domain = Object.create(config)
    }

    this.domains[this.domains.length] = [ key, domain ]

    // Reset the registry
    this.registry = {}

    if (domain.setup) {
      domain.setup(this.repo, options)
    }

    return domain
  },

  reduce (fn, state, scope) {
    for (var i = 0; i < this.domains.length; i++) {
      const [key, domain] = this.domains[i]

      state = fn.call(scope, state, key, domain)
    }

    return state
  },

  teardown () {
    for (var i = 0; i < this.domains.length; i++) {
      let domain = this.domains[i][1]

      if (domain.teardown) {
        domain.teardown(this.repo)
      }
    }
  }

}
