import { Subject } from './subject'
import { merge } from './data'
import { spawn, Cache } from './registry'
import { RESET, PATCH, INITIAL_STATE } from './lifecycle'

export function domainEngine(repo, key, entity, domainOptions) {
  let options = merge(repo.options, entity.defaults, { key }, domainOptions)
  let domain = spawn(entity, options, repo)

  let start = domain.getInitialState ? domain.getInitialState() : undefined
  let ledger = new Map([
    [INITIAL_STATE, { state: start, status: 'complete', payload: null }]
  ])
  let answer = new Subject()

  // Push an initial iteration in case this state is subscribed to
  // before an action fires
  answer.next(start)

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

  function clean(action) {
    if (!repo.options.debug) {
      ledger.delete(repo.history.before(action))
    }
  }

  // In order to prevent extra overhead, only subscribe to actions within
  // this domain's registry
  let tracker = repo.history.subscribe(action => {
    if (registry.respondsTo(action) === false) {
      return null
    }

    let dispatcher = () => {
      let next = rollforward(ledger, registry, repo, domain, action)

      if (next !== answer.payload) {
        answer.next(next)
      }

      if (action.closed) {
        clean(action)
      }
    }

    return action.subscribe({
      next: dispatcher,
      complete: dispatcher,
      error: dispatcher,
      cancel: dispatcher
    })
  })

  if (domain.setup) {
    domain.setup(repo, options)
  }

  repo.subscribe({
    complete() {
      tracker.unsubscribe()

      if (domain.teardown) {
        domain.teardown(repo, options)
      }
    }
  })

  return { domain, answer }
}

function recall(ledger, repo, action) {
  while (action) {
    if (ledger.has(action)) {
      return ledger.get(action)
    }

    action = repo.history.before(action)
  }

  return ledger.get(INITIAL_STATE)
}

function rollforward(ledger, registry, repo, domain, action) {
  let revision = recall(ledger, repo, repo.history.before(action))
  let state = revision.state

  while (action) {
    let current = recall(ledger, repo, action)

    // Optimization: Prevent dispatch if params did not change
    if (
      // If the reference to the prior state is the same
      state === current.state &&
      // And the payload is the same
      current.payload === action.payload &&
      // And the status is the same
      current.status === action.status
    ) {
      // Pure functions mean nothing will change
      break
    }

    if (!action.disabled) {
      let handlers = registry.resolve(action)
      for (var i = 0, len = handlers.length; i < len; i++) {
        state = handlers[i].call(domain, state, action.payload, action.meta)
      }
    }

    ledger.set(action, {
      state: state,
      status: action.status,
      payload: action.payload
    })

    action = repo.history.after(action)
  }

  return state
}

function patch(key, start, payload, repo) {
  let { deserialize, data } = payload

  let value = data[key] === undefined ? start : data[key]
  if (deserialize && this.deserialize) {
    return this.deserialize(value)
  }

  return value
}
