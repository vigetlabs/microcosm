/**
 * @flow
 */

import MetaDomain from './meta-domain'
import getRegistration from './get-registration'
import { get, set, createOrClone } from './utils'
import { castPath, type KeyPath } from './key-path'

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

    return handler ? [{ key: [], source: this.repo, handler }] : []
  }

  getHandlers(action: Action): Registrations {
    let handlers = this.getRepoHandlers(action)

    let { command, status } = action

    for (var i = 0, len = this.domains.length; i < len; i++) {
      var [key, domain] = this.domains[i]

      if (domain.register) {
        var handler = getRegistration(domain.register(), command, status)

        if (handler) {
          handlers.push({ key, source: domain, handler })
        }
      }
    }

    return handlers
  }

  register(action: Action): Registrations {
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

  dispatch(action: Action, state: Object, snapshot: Snapshot) {
    let handlers = this.register(action)
    let result = state

    for (var i = 0, len = handlers.length; i < len; i++) {
      var { key, source, handler } = handlers[i]

      var last = get(result, key)
      var current = get(snapshot.last, key)

      if (
        // If the state different
        last !== current ||
        // Or the payload is different
        action.payload !== snapshot.payload ||
        // or the status is different
        action.status !== snapshot.status
      ) {
        var next = handler.call(source, last, action.payload)

        result = set(result, key, next)
      } else {
        result = set(result, key, get(snapshot.next, key))
      }
    }

    return result
  }

  deserialize(payload: Object): Object {
    let next = payload

    for (var i = 0; i < this.domains.length; i++) {
      var [key, domain] = this.domains[i]

      if (domain.deserialize) {
        next = set(next, key, domain.deserialize(get(payload, key)))
      }
    }

    return next
  }

  serialize(state: Object, payload: Object): Object {
    let next = payload

    for (var i = 0; i < this.domains.length; i++) {
      var [key, domain] = this.domains[i]

      if (domain.serialize) {
        next = set(next, key, domain.serialize(get(state, key)))
      }
    }

    return next
  }
}

export default DomainEngine
