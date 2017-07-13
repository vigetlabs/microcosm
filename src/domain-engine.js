/**
 * @flow
 */

import MetaDomain from './meta-domain'
import Registration from './registration'
import getRegistration from './get-registration'
import { get, set, createOrClone } from './utils'
import { castPath, getKeyString, type KeyPath } from './key-path'

import type Action from './action'
import type Microcosm from './microcosm'

type DomainList = Array<[KeyPath, Domain]>
type Registry = { [*]: Registrations }

class DomainEngine {
  repo: Microcosm
  registry: Registry
  domains: DomainList

  constructor(repo: *) {
    this.repo = repo
    this.registry = {}
    this.domains = []

    // All realms contain a meta domain for basic Microcosm operations
    this.add([], MetaDomain)
  }

  getRepoHandlers(action: Action): Registrations {
    let { command, status } = action

    let handler = getRegistration(this.repo.register(), command, status)

    return handler ? [new Registration([], this.repo, handler)] : []
  }

  getHandlers(action: Action): Registrations {
    let handlers = this.getRepoHandlers(action)

    let { command, status } = action

    for (var i = 0, len = this.domains.length; i < len; i++) {
      var [key, domain] = this.domains[i]

      if (domain.register) {
        var handler = getRegistration(domain.register(), command, status)

        if (handler) {
          handlers.push(new Registration(key, domain, handler))
        }
      }
    }

    return handlers
  }

  register(action: Action): Array<Handler> {
    let type = action.type

    if (!this.registry[type]) {
      this.registry[type] = this.getHandlers(action)
    }

    return this.registry[type]
  }

  add(key: string | KeyPath, config: Object | Function, options?: Object) {
    let domain: Domain = createOrClone(config, options, this.repo)
    let keyPath: KeyPath = castPath(key)

    this.domains.push([keyPath, domain])

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

  reduce(fn: Function, state: Object, scope: *) {
    let next = state

    // Important: start at 1 to avoid the meta domain
    for (var i = 1, len = this.domains.length; i < len; i++) {
      let [key, domain] = this.domains[i]

      next = fn.call(scope, next, key, domain)
    }

    return next
  }

  supportsKey(key: string) {
    if (key in this.repo.state) {
      return true
    }

    return this.domains.some(entry => getKeyString(entry[0]) === key)
  }

  sanitize(data: Object) {
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

  dispatch(state: Object, action: Action): Object {
    let handlers = this.register(action)
    let result = state

    for (var i = 0, len = handlers.length; i < len; i++) {
      var { key, domain, handler } = handlers[i]

      var last = get(result, key)
      var next = handler.call(domain, last, action.payload)

      result = set(result, key, next)
    }

    return result
  }

  deserialize(payload: Object): Object {
    return this.reduce(function(memo, key, domain) {
      if (domain.deserialize) {
        return set(memo, key, domain.deserialize(get(payload, key)))
      }

      return memo
    }, payload)
  }

  serialize(state: Object, payload: Object): Object {
    return this.reduce(function(memo, key, domain) {
      if (domain.serialize) {
        return set(memo, key, domain.serialize(get(state, key)))
      }

      return memo
    }, payload)
  }
}

export default DomainEngine
