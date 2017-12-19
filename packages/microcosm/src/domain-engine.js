/**
 * @flow
 */

import { merge, result, createOrClone } from './utils'
import { setup, teardown, getHandlers } from './registry'
import {
  RESET,
  PATCH,
  INITIAL_STATE,
  DESERIALIZE,
  SERIALIZE
} from './lifecycle'

class DomainEngine {
  _domains: { [key: string]: Domain }

  constructor(repo: Microcosm) {
    this._domains = {}

    let tracker = repo.history.updates.subscribe(this.track.bind(this, repo))

    repo.subscribe({ complete: tracker.unsubscribe })
  }

  track(repo, action) {
    let bound = this.rollforward.bind(this, repo, action)

    action.subscribe({
      start: bound,
      next: bound,
      complete: bound,
      error: bound
    })
  }

  rollforward(repo, action) {
    while (action) {
      let last = repo.history.recall(action, repo)
      let next = last

      if (action.disabled === false) {
        next = this.dispatch(action, last)
      }

      repo.history.stash(action, repo, next)

      action = repo.history.after(action)
    }
  }

  add(repo, key: string, config: *, options?: Object) {
    let deepOptions = merge(repo.options, config.defaults, { key }, options)
    let domain: Domain = createOrClone(config, deepOptions, repo)

    this._domains[key] = domain

    repo.subscribe({
      start: setup(repo, domain, deepOptions),
      complete: teardown(repo, domain, deepOptions)
    })

    return domain
  }

  lifecycle(type, state) {
    for (var key in this._domains) {
      var domain = this._domains[key]

      switch (type) {
        case INITIAL_STATE:
          state[key] = result(domain, 'getInitialState')
          break
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
    if (action.id === RESET) {
      return reset(this._domains, action, state)
    }

    if (action.id === PATCH) {
      return patch(this._domains, action, state)
    }

    for (var key in this._domains) {
      var domain = this._domains[key]
      var handlers = getHandlers(result(domain, 'register') || {}, action)
      var last = key in state ? state[key] : result(domain, 'getInitialState')

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
