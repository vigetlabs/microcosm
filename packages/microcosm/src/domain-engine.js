/**
 * @flow
 */

import getRegistration from './get-registration'
import { clone, merge, result, createOrClone } from './utils'
import {
  RESET,
  PATCH,
  INITIAL_STATE,
  DESERIALIZE,
  SERIALIZE
} from './lifecycle'

import type Action from './action'
import type Microcosm from './microcosm'

type DomainList = { [key: string]: Domain }

const noop = () => {}
const identity = n => n

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
  domains: DomainList
  lifecycle: Registry
  registry: Registry

  constructor(repo: Microcosm) {
    this.repo = repo
    this.domains = {}
    this.lifecycle = {
      [INITIAL_STATE]: [],
      [RESET]: [],
      [PATCH]: [],
      [DESERIALIZE]: [],
      [SERIALIZE]: []
    }

    this.registry = Object.create(this.lifecycle)
  }

  getHandlers(action: Action): Registrations {
    let { command, status } = action

    let handlers = []

    for (var key in this.domains) {
      var scope = this.domains[key]

      let steps = getRegistration(result(scope, 'register'), command, status)

      if (steps.length) {
        handlers.push({ key, scope, steps, local: false })
      }
    }

    return handlers
  }

  register(action: Action): Registrations {
    let type = action.command[action.status]

    if (!this.registry[type]) {
      this.registry[type] = this.getHandlers(action)
    }

    return this.registry[type]
  }

  add(key: string, config: *, options?: Object) {
    if (key in this.domains) {
      throw new Error(
        `Can not add domain for "${key}". Another domain was already added`
      )
    }

    console.assert(
      !options || options.constructor === Object,
      'addDomain expected a plain object as the third argument.'
    )

    console.assert(key && key.length > 0, 'Can not add domain to root level.')

    let deepOptions = merge(
      this.repo.options,
      config.defaults,
      { key },
      options
    )

    let domain: Domain = createOrClone(config, deepOptions, this.repo)

    this.domains[key] = domain

    if ('getInitialState' in domain) {
      this.lifecycle[INITIAL_STATE.toString()].push({
        key: key,
        scope: domain,
        steps: [domain.getInitialState]
      })
    }

    this.lifecycle[DESERIALIZE.toString()].push({
      key: key,
      scope: domain,
      steps: [domain.deserialize || identity]
    })

    this.lifecycle[SERIALIZE.toString()].push({
      key: key,
      scope: domain,
      steps: [domain.serialize || noop]
    })

    this.lifecycle[RESET.toString()].push({
      key: key,
      local: true,
      scope: domain,
      steps: [
        (state: *, data: any) => {
          return data[key] !== undefined
            ? data[key]
            : result(domain, 'getInitialState')
        }
      ]
    })

    this.lifecycle[PATCH.toString()].push({
      key: key,
      local: true,
      scope: domain,
      steps: [
        (state: *, data: any) => {
          return data[key] !== undefined ? data[key] : state
        }
      ]
    })

    this.registry = Object.create(this.lifecycle)

    this.repo.observable.subscribe({
      start: () => {
        if (domain.setup) {
          domain.setup(this.repo, deepOptions)
        }
      },
      complete: () => {
        if (domain.teardown) {
          domain.teardown(this.repo)
        }
      }
    })

    return domain
  }

  dispatch(action: Action, state: Object) {
    let handlers = this.register(action)
    let answer = Object.create(state)

    for (var i = 0; i < handlers.length; i++) {
      var { local, key, scope, steps } = handlers[i]

      if (local && action.origin !== this.repo) {
        continue
      }

      let next = reduce(steps, action.payload, answer[key], scope)

      if (next !== answer[key]) {
        answer[key] = next
      }
    }

    return answer
  }

  getInitialState(): Object {
    return this.dispatch(
      {
        origin: this.repo,
        status: 'complete',
        command: INITIAL_STATE,
        payload: null
      },
      {}
    )
  }
}

export default DomainEngine
