import { Subject } from './subject'
import { merge } from './data'
import { spawn, Cache } from './registry'
import { RESET, PATCH, INITIAL_STATE } from './lifecycle'

export function domainEngine(repo, key, entity, domainOptions) {
  let options = merge(repo.options, entity.defaults, { key }, domainOptions)
  let domain = spawn(entity, options, repo)

  let start = domain.getInitialState ? domain.getInitialState() : undefined
  let ledger = new Map([[INITIAL_STATE, start]])
  let answer = new Subject(start)

  let registry = new Cache(domain, {
    [RESET]: {
      complete: (state, data, meta) => {
        return repo === meta.origin ? patch(key, start, data) : state
      }
    },
    [PATCH]: {
      complete: (state, data, meta) => {
        return repo === meta.origin ? patch(key, state, data) : state
      }
    }
  })

  // In order to prevent extra overhead, only subscribe to actions within
  // this domain's registry
  let tracker = repo.history.updates.subscribe(action => {
    if (registry.respondsTo(action) === false) {
      return null
    }

    let dispatcher = () => {
      rollforward(answer, ledger, registry, repo, domain, action)
    }

    return action.subscribe({
      start: dispatcher,
      next: dispatcher,
      complete: dispatcher,
      error: dispatcher,
      unsubscribe: dispatcher
    })
  })

  repo.subscribe({
    start() {
      if (domain.setup) {
        domain.setup(repo, options)
      }
    },
    cleanup() {
      tracker.unsubscribe()

      if (domain.teardown) {
        domain.teardown(repo, options)
      }
    }
  })

  return { domain, answer }
}

function rollforward(answer, ledger, registry, repo, domain, action) {
  let prior = repo.history.before(action)
  let state = ledger.has(prior) ? ledger.get(prior) : ledger.get(INITIAL_STATE)

  loop: while (action) {
    let next = state

    if (!action.disabled) {
      let handlers = registry.resolve(action)

      for (var i = 0, len = handlers.length; i < len; i++) {
        next = handlers[i].call(domain, next, action.payload, action.meta)
      }

      if (next === state) {
        break loop
      }
    }

    ledger.set(action, next)
    action = repo.history.after(action)
    state = next
  }

  answer.next(state)
}

function patch(key, start, payload, repo) {
  let { deserialize, data } = payload

  let value = data[key] === undefined ? start : data[key]
  if (deserialize && this.deserialize) {
    return this.deserialize(value)
  }

  return value
}
