/**
 * A cluster of domains. Mostly for ergonomics
 */

import Domain from './domain'
import getDomainHandlers from './getDomainHandlers'
import merge from './merge'

export default class Realm {

  constructor(repo) {
    this.repo = repo
    this.domains = []
    this.registry = {}
  }

  register (type) {
    if (this.registry.hasOwnProperty(type) === false) {
      this.registry[type] = getDomainHandlers(this.domains, type)
    }

    return this.registry[type]
  }

  add (key, config) {
    if (arguments.length < 2) {
      // Important! Assignment this way is important
      // to support IE9, which has an odd way of referencing
      // arguments
      config = key
      key = null
    }

    let domain = null

    if (typeof config === 'function') {
      domain = new config()
    } else {
      domain = merge({}, config)
    }

    // Allow for simple classes and object primitives. Make sure
    // they implement the key Domain methods.
    Domain.ensure(domain)

    this.domains[this.domains.length] = [ key, domain ]

    // Reset the registry
    this.registry = {}

    domain.setup(this.repo)

    return this
  }

  reduce (fn, state, scope) {
    for (var i = 0; i < this.domains.length; i++) {
      const [key, domain] = this.domains[i]

      state = fn.call(scope, state, key, domain)
    }

    return state
  }

  teardown () {
    for (var i = 0; i < this.domains.length; i++) {
      this.domains[i][1].teardown(this.repo)
    }
  }

}
