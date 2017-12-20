/**
 * @flow
 */

import { merge } from './data'
import { setup, teardown, getHandlers, buildRegistry } from './registry'

import { RESET, PATCH, DESERIALIZE, SERIALIZE, COMPLETE } from './lifecycle'

class DomainEngine {
  _domains: { [key: string]: Domain }

  constructor(repo: Microcosm) {
    this._domains = {}
    this._initialState = {}

    let tracker = repo.history.updates.subscribe(this.track.bind(this, repo))

    repo.subscribe({ complete: tracker.unsubscribe })
  }

  getInitialState() {
    return this._initialState
  }

  track(repo, action) {
    action.every(this.rollforward.bind(this, repo))
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

    if (domain.getInitialState) {
      this._initialState[key] = domain.getInitialState()
    }

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
    if (action.tag === RESET && action.status === COMPLETE) {
      return reset(this._domains, action, state)
    }

    if (action.tag === PATCH && action.status === COMPLETE) {
      return patch(this._domains, action, state)
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
}

function patch(domains, action, state) {
  let next = {}

  for (var key in domains) {
    next[key] = action.payload[key]
  }

  return merge(state, next)
}

function reset(domains, action, state) {
  let next = {}

  for (var key in this._domains) {
    next[key] = action.payload[key]
  }

  return merge(state, next)
}

export default DomainEngine
