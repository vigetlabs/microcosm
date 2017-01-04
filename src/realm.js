import MetaDomain from './meta-domain'
import getDomainHandlers from './get-domain-handlers'

/**
 * A cluster of domains. Mostly for ergonomics
 */
export default function Realm (repo) {
  this.repo = repo
  this.domains = []
  this.registry = {}

  // All realms contain a meta domain for basic Microcosm operations
  this.add(null, MetaDomain)
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

    if (typeof config === 'function') {
      domain = new config(options)
    } else {
      domain = Object.create(config)
    }

    this.domains.push([key, domain])

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

}
