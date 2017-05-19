/**
 * @fileoverview A general modelling class used by the Presenter's
 * getModel function.
 */

import { set, Emitter } from '../microcosm'

function isObservable(binding) {
  return binding && typeof binding.subscribe === 'function'
}

function isCallable(binding) {
  return binding && typeof binding.call === 'function'
}

function invoke(binding, repo, scope) {
  if (isCallable(binding)) {
    return binding.call(scope, repo.state, repo)
  }

  return binding
}

export default class Model extends Emitter {
  /**
   * @param {Microcosm} repo Track this Microcosm instance for updates
   * @param {scope} scope Scope to invoke functional bindings
   */
  constructor(repo, scope) {
    super()

    this.repo = repo
    this.scope = scope
    this.bindings = {}
    this.subscriptions = {}
    this.value = {}

    this.repo.on('change', this.compute, this)
  }

  /**
   * Track an observable. Sending updates to a given key.
   * @param {string} key
   * @param {Observable} observable
   */
  track(key, observable) {
    let last = this.subscriptions[key]
    let next = observable.subscribe(value => this.set(key, value))

    this.subscriptions[key] = next

    if (last) {
      last.unsubscribe()
    }
  }

  /**
   * @param {Object} bindings A set of key/value pairs for building a model
   */
  bind(bindings) {
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

  /**
   * Update a specific model key. Emits a change event
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    let next = set(this.value, key, value)

    if (this.value !== next) {
      this.value = next
      this._emit('change', this.value)
    }
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

    if (last !== next) {
      this.value = next
      this._emit('change', this.value)
    }
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
