/**
 * @fileoverview A general modelling class used by the Presenter's
 * getModel function.
 * @flow
 */

import { type Microcosm, Emitter, merge } from '../index'

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

type Answer = { [string]: * }

export default class Model extends Emitter {
  repo: Microcosm
  scope: Object
  bindings: *[]
  subscriptions: { [string]: * }
  pendingUpdate: Job
  publish: () => void
  patch: Answer
  value: Answer

  constructor(repo: Microcosm, scope: Object) {
    super()

    this.repo = repo
    this.scope = scope
    this.bindings = []
    this.subscriptions = {}
    this.value = {}
    this.patch = {}
    this.publish = this.publish.bind(this)
    this.pendingUpdate = null
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

  bind(bindings: Object) {
    this.bindings.length = 0

    for (var key in bindings) {
      let binding = bindings[key]

      if (isObservable(binding)) {
        this.track(key, binding)
      } else {
        this.bindings.push({ key, callback: binding })
      }
    }

    if (this.bindings.length) {
      this.repo.on('change', this.compute, this)
    } else {
      this.repo.off('change', this.compute, this)
    }

    this.compute()
    this.commit(merge(this.value, this.patch))
  }

  empty() {
    this.patch = {}

    if (this.pendingUpdate) {
      this.pendingUpdate.cancel()
      this.pendingUpdate = null
    }
  }

  commit(value: Answer) {
    this.value = value
    this.empty()
  }

  publish() {
    let next = merge(this.value, this.patch)

    this._emit('will-change', next, this.patch)
    this.commit(next)
    this._emit('change', next)
  }

  enqueue() {
    const { batch, updater } = this.repo.history

    if (!this.pendingUpdate) {
      this.pendingUpdate = updater(this.publish)
    }
  }

  /**
   * Update a specific model key. Emits a change event
   */
  set(key: string, value: *) {
    if (this.value[key] !== value) {
      this.patch[key] = value
      this.enqueue()
    }
  }

  /**
   * Run through each invokable binding, recomputing the model
   * for their associated keys.
   */
  compute() {
    let dirty = false
    for (var i = 0; i < this.bindings.length; i++) {
      var { key, callback } = this.bindings[i]

      var value = invoke(callback, this.repo, this.scope)

      if (this.value[key] !== value) {
        this.patch[key] = value
        dirty = true
      }
    }

    if (dirty) {
      this.enqueue()
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

    this.empty()

    this.repo.off('change', this.compute, this)
  }
}
