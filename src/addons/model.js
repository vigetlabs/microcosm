/**
 * @fileoverview A general modelling class used by the Presenter's
 * getModel function.
 * @flow
 */

import { type Microcosm, Emitter, set } from '../microcosm'

function isObservable(binding: *): boolean {
  return binding && typeof binding.subscribe === 'function'
}

function isCallable(binding: *): boolean {
  return binding && typeof binding.call === 'function'
}

function invoke(binding: *, repo: Microcosm, scope: Object): * {
  if (isCallable(binding)) {
    return binding.call(scope, repo.state, repo)
  }

  return binding
}

export default class Model extends Emitter {
  repo: Microcosm
  scope: Object
  bindings: { [key: string]: * }
  subscriptions: { [key: string]: * }
  revision: number
  value: *

  constructor(repo: Microcosm, scope: Object) {
    super()

    this.repo = repo
    this.scope = scope
    this.bindings = {}
    this.subscriptions = {}
    this.value = {}
    this.revision = 0

    this.repo.on('change', this.compute, this)
  }

  /**
   * Track an observable. Sending updates to a given key.
   */
  track(key: string, observable: *) {
    let last = this.subscriptions[key]
    let next = observable.subscribe(value => this.set(key, value))

    this.subscriptions[key] = next

    if (last) {
      last.unsubscribe()
    }
  }

  bind(bindings: { [key: string]: * }) {
    this.bindings = {}

    for (var key in bindings) {
      let binding = bindings[key]

      if (isObservable(binding)) {
        this.track(key, binding)
      } else {
        this.bindings[key] = binding
      }
    }

    this.compute()
  }

  publish(value: *) {
    if (value !== this.value) {
      this.value = value
      this.revision += 1

      this._emit('change', this.value)
    }

    return value
  }

  /**
   * Update a specific model key. Emits a change event
   */
  set(key: string, value: *) {
    return this.publish(set(this.value, key, value))
  }

  /**
   * Run through each invokable binding, recomputing the model
   * for their associated keys.
   */
  compute() {
    let last = this.value
    let next = last
    for (var key in this.bindings) {
      var value = invoke(this.bindings[key], this.repo, this.scope)

      next = set(next, key, value)
    }

    return this.publish(next)
  }

  /**
   * Dispose a model, removing all subscriptions and unsubscribing
   * from the repo.
   */
  teardown() {
    for (var key in this.subscriptions) {
      this.subscriptions[key].unsubscribe()
    }

    this.repo.off('change', this.compute, this)
  }
}
