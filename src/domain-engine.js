/**
 * @flow
 */

import MetaDomain from './meta-domain'
import getRegistration from './get-registration'
import { get, set, merge, createOrClone } from './utils'
import { castPath, type KeyPath } from './key-path'
import assert from 'assert'

import type Action from './action'
import type Microcosm from './microcosm'

type DomainList = Array<[KeyPath, Domain]>
type Registry = { [action: string]: Registrations }

/**
 * Reduce down a list of values.
 */
function reduce(steps: Handler[], payload: *, start: *, scope: any) {
  var next = start

  for (var i = 0, len = steps.length; i < len; i++) {
    next = steps[i].call(scope, next, payload)
  }

  return next
}

class DomainEngine {
  repo: Microcosm
  registry: Registry
  domains: DomainList

  constructor(repo: Microcosm) {
    this.repo = repo
    this.registry = {}
    this.domains = []

    // All realms contain a meta domain for basic Microcosm operations
    this.add([], MetaDomain)
  }

  getRepoHandlers(action: Action): Registrations {
    let { command, status } = action

    let steps = getRegistration(this.repo.register(), command, status)

    return steps.length ? [{ key: [], scope: this.repo, steps }] : []
  }

  getHandlers(action: Action): Registrations {
    let handlers = this.getRepoHandlers(action)

    let { command, status } = action

    for (var i = 0; i < this.domains.length; i++) {
      var [key, scope] = this.domains[i]

      if (scope.register) {
        let steps = getRegistration(scope.register(), command, status)

        if (steps.length) {
          handlers.push({ key, scope, steps })
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

  add(key: string | KeyPath, config: *, options?: Object) {
    assert(
      !options || options.constructor === Object,
      'addDomain expected a plain object as the second argument. ' +
        'Instead got ' +
        get(options, 'constructor.name', 'Unknown')
    )

    let deepOptions = merge(
      this.repo.options,
      config.defaults,
      { key },
      options
    )

    let keyPath: KeyPath = castPath(key)
    let domain: Domain = createOrClone(config, deepOptions, this.repo)

    this.domains.push([keyPath, domain])

    // Reset the registry
    this.registry = {}

    if (domain.setup) {
      domain.setup(this.repo, deepOptions)
    }

    if (domain.teardown) {
      this.repo.on('teardown', domain.teardown, domain)
    }

    return domain
  }

  dispatch(action: Action, state: Object, snapshot: Snapshot) {
    let handlers = this.register(action)
    let result = state

    for (var i = 0; i < handlers.length; i++) {
      var { key, scope, steps } = handlers[i]

      var base = get(result, key, null)
      var head = get(snapshot.last, key, null)

      if (
        // If the reference to the prior state changed
        base !== head ||
        // Or the payload is different
        action.payload !== snapshot.payload ||
        // or the status is different
        action.status !== snapshot.status
      ) {
        // Yes: recalculate state from the base
        result = set(result, key, reduce(steps, action.payload, base, scope))
      } else {
        // No: use the existing snapshot value (memoizing the domain handler)
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
