/**
 * A cluster of domains. Mostly for ergonomics
 */

import Domain from './domain'
import getDomainHandlers from './getDomainHandlers'
import merge from './merge'

export default class Realm {

  constructor() {
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
      domain = merge(new Domain(), config)
    }

    this.domains[this.domains.length] = [ key, domain ]

    // Reset the registry
    this.registry = {}

    return this
  }

  reduce (fn, state, scope) {
    for (var i = 0; i < this.domains.length; i++) {
      const [key, domain] = this.domains[i]

      state = fn.call(scope, state, key, domain)
    }

    return state
  }

  teardown() {
    for (var i = 0; i < this.domains.length; i++) {
      this.domains[i][1].teardown()
    }
  }

}
