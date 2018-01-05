/**
 * @flow
 */

import { Observable, observerHash } from './observable'
import { Subject } from './subject'
import { clone, merge } from './data'
import { spawn, setup, teardown, getHandlers, buildRegistry } from './registry'
import { RESET, PATCH, DESERIALIZE, SERIALIZE, COMPLETE } from './lifecycle'
import coroutine from './coroutine'

class DomainEngine {
  _domains: { [key: string]: Domain }

  constructor(repo) {
    this._repo = repo
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
    let domain: Domain = spawn(entity, options, repo)

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
    if (action.meta.origin === this._repo && action.status === COMPLETE) {
      if (action.tag === String(RESET)) {
        return patch(this._domains, action, this._initialState)
      }

      if (action.tag === String(PATCH)) {
        return patch(this._domains, action, state)
      }
    }

    for (let key in this._domains) {
      let domain = this._domains[key]
      let handlers = getHandlers(buildRegistry(domain), action)
      let last = key in state ? state[key] : this._initialState[key]

      for (let i = 0; i < handlers.length; i++) {
        state[key] = handlers[i].call(domain, last, action.payload)
      }
    }

    return state
  }
}

function patch(domains, action, state) {
  let next = clone(state)

  for (var key in domains) {
    if (key in action.payload) {
      next[key] = action.payload[key]
    }
  }

  return next
}

export default DomainEngine
