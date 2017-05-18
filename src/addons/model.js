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
  constructor(repo, scope) {
    super()

    this.repo = repo
    this.scope = scope
    this.bindings = {}
    this.subscriptions = {}
    this.value = {}

    this.repo.on('change', this.compute, this)
  }

  subscribe(key, binding) {
    let last = this.subscriptions[key]
    let next = binding.subscribe(value => this.set(key, value))

    this.subscriptions[key] = next

    if (last) {
      last.unsubscribe()
    }
  }

  bind(bindings) {
    this.bindings = {}

    for (var key in bindings) {
      let binding = bindings[key]

      if (isObservable(binding)) {
        this.subscribe(key, binding)
      } else {
        this.bindings[key] = binding
      }
    }

    this.compute()
  }

  set(key, value) {
    let next = set(this.value, key, value)

    if (this.value !== next) {
      this.value = next
      this._emit('change', this.value)
    }
  }

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

    return next
  }

  teardown() {
    for (var key in this.subscriptions) {
      this.subscriptions[key].unsubscribe()
    }

    this.repo.off('change', this.compute, this)
  }
}
