/**
 * A cluster of domains. Mostly for ergonomics
 */

import Domain from './domain'
import getDomainHandlers from './getDomainHandlers'
import merge from './merge'

export default function Realm (repo) {
  this.repo = repo
  this.domains = []
  this.registry = {}
}

Realm.prototype = {

  register (type) {
    if (this.registry[type] == null) {
      this.registry[type] = getDomainHandlers(this.domains, type)
    }

    return this.registry[type]
  },

  add (key, config) {
    if (arguments.length < 2) {
      // Important! Assignment this way is important
      // to support IE9, which has an odd way of referencing
      // arguments
      config = key
      key = []
    }

    let domain = null

    if (typeof config === 'function') {
      domain = new config()
    } else {
      domain = merge({}, config)
    }

    // Assign the domain to a given realm and key to allow for nesting
    domain._key   = [].concat(key)
    domain._realm = this

    // Allow for simple classes and object primitives. Make sure
    // they implement the key Domain methods.
    Domain.ensure(domain)

    this.domains[this.domains.length] = [ domain._key, domain ]

    // Reset the registry
    this.registry = {}

    domain.setup(this.repo)

    return this
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
      this.domains[i][1].teardown(this.repo)
    }
  }

}
