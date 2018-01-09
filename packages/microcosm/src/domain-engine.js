// @flow
import { clone, merge } from './data'
import { spawn, setup, teardown, getHandlers, buildRegistry } from './registry'
import { RESET, PATCH, COMPLETE } from './lifecycle'

type DomainMap = { key: Domain }

class DomainEngine {
  _domains: DomainMap

  constructor(repo) {
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
        next = this.dispatch(repo, action, last)
      }

      repo.history.stash(action, repo, next)

      action = repo.history.after(action)
    }
  }

  add(repo: *, key: string, entity: *, domainOptions?: Object) {
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

  serialize(state) {
    let next = {}

    for (let key in this._domains) {
      let domain = this._domains[key]

      if ('serialize' in domain) {
        next[key] = domain.serialize(state[key])
      }
    }

    return next
  }

  dispatch(repo: *, action: Subject, state: Object) {
    if (action.meta.origin === repo && action.status === COMPLETE) {
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

      if (key in state === false) {
        state[key] = this._initialState[key]
      }

      for (let i = 0; i < handlers.length; i++) {
        state[key] = handlers[i].call(domain, state[key], action.payload)
      }
    }

    return state
  }
}

function patch(domains, action, state) {
  let { data, deserialize } = action.payload

  let next = clone(state)

  for (var key in domains) {
    let domain = domains[key]

    if (key in data) {
      if (deserialize && 'deserialize' in domain) {
        next[key] = domain.deserialize(data[key])
      } else {
        next[key] = data[key]
      }
    }
  }

  return next
}

export default DomainEngine
