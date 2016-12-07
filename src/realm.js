/**
 * A cluster of domains. Mostly for ergonomics
 */

import getDomainHandlers from './getDomainHandlers'
import merge from './merge'

export default function Realm (repo) {
  this.repo = repo
  this.domains = []
  this.registry = {}

  // Teardown all domains when the repo tears down
  this.repo.on('teardown', this.teardown, this)
}

Realm.prototype = {

  register (type) {
    if (this.registry[type] == null) {
      this.registry[type] = getDomainHandlers(this.domains, type)
    }

    return this.registry[type]
  },

  add (key, config, options) {
    let domain = null

    if (key != null && typeof key !== 'string') {
      throw new Error('Domains must be mounted to a string key, or null for the root. ' +
                      'Instead got: ' + key)
    }

    if (typeof config === 'function') {
      domain = new config(options)
    } else {
      domain = merge({}, config)
    }

    this.domains[this.domains.length] = [ key, domain ]

    // Reset the registry
    this.registry = {}

    if (domain.setup) {
      domain.setup(this.repo, options)
    }

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
      let domain = this.domains[i][1]

      if (domain.teardown) {
        domain.teardown(this.repo)
      }
    }
  }

}
