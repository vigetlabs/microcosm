/**
 * @flow
 */

import { Observable, observerHash } from './observable'
import { Subject } from './subject'
import { merge } from './data'
import { setup, teardown, getHandlers, buildRegistry } from './registry'
import { RESET, PATCH, DESERIALIZE, SERIALIZE, COMPLETE } from './lifecycle'
import coroutine from './coroutine'

const FETCH = function(key, value) {
  return observerHash({ [key]: value })
}

class DomainEngine {
  _domains: { [key: string]: Domain }

  constructor() {
    this._domains = {}
    this._initialState = {}
  }

  getInitialState() {
    return this._initialState
  }

  rollforward(repo, action) {
    while (action) {
      let last = repo.history.recall(action, repo) || this.initialState
      let next = last

      if (action.disabled === false) {
        next = this.dispatch(action, last)
      }

      repo.history.stash(action, repo, next)

      action = repo.history.after(action)
    }
  }

  add(repo, key: string, entity: *, domainOptions?: Object) {
    let options = merge(repo.options, entity.defaults, { key }, domainOptions)
    let domain: Domain =
      typeof entity === 'function'
        ? new entity(options, repo)
        : Object.create(entity)

    this._domains[key] = domain

    this._initialState[key] = domain.getInitialState
      ? domain.getInitialState()
      : null

    repo.subscribe({
      start: setup(repo, domain, options),
      complete: teardown(repo, domain, options)
    })

    return domain
  }

  lifecycle(type, state) {
    for (var key in this._domains) {
      var domain = this._domains[key]

      switch (type) {
        case DESERIALIZE:
          if ('deserialize' in domain) {
            state[key] = domain.deserialize(state[key])
          }
          break
        case SERIALIZE:
          if ('serialize' in domain) {
            state[key] = domain.serialize(state[key])
          } else {
            delete state[key]
          }
          break
        default:
      }
    }

    return state
  }

  dispatch(action: Action, state: Object) {
    if (action.status === COMPLETE) {
      if (action.tag === String(RESET)) {
        return reset(this._domains, action, this._initialState)
      }

      if (action.tag === String(PATCH)) {
        return patch(this._domains, action, state)
      }

      if (action.tag === String(FETCH)) {
        return patch(this._domains, action, state)
      }
    }

    for (var key in this._domains) {
      var domain = this._domains[key]
      var handlers = getHandlers(buildRegistry(domain), action)
      var last = key in state ? state[key] : this._initialState[key]

      for (var i = 0; i < handlers.length; i++) {
        state[key] = handlers[i].call(domain, last, action.payload)
      }
    }

    return state
  }

  fetch(repo, key, method, ...args) {
    let domain = this._domains[key]

    if (!domain) {
      throw new TypeError(
        `Unable to fetch from ${key}:${method}. Missing domain.`
      )
    }

    let entity = domain.entity

    if (!entity) {
      throw new TypeError(
        `Unable to fetch from ${key}:${method}. Missing entity.`
      )
    }

    if (!entity[method]) {
      throw new TypeError(
        `Unable to fetch from ${key}:${method}. Missing method.`
      )
    }

    return repo
      .push(FETCH, key, entity[method](...args))
      .map(state => state[key])
  }
}

function patch(domains, action, state) {
  let next = {}

  for (var key in domains) {
    next[key] = action.payload[key]
  }

  return merge(state, next)
}

function reset(domains, action, base) {
  let next = {}

  for (var key in domains) {
    if (key in action.payload) {
      next[key] = action.payload[key]
    } else {
      next[key] = base[key]
    }
  }

  return next
}

export default DomainEngine
