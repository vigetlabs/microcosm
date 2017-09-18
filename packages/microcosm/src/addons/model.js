/**
 * @fileoverview A general modelling class used by the Presenter's
 * getModel function.
 * @flow
 */

import { type Microcosm, Emitter, merge } from '../index'
import { type Job } from '../default-update-strategy'

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
  _scope: Object
  _repo: Microcosm
  _bindings: *[]
  _subscriptions: { [string]: * }
  _pendingUpdate: ?Job
  _publish: () => void
  _patch: Answer

  value: Answer

  constructor(repo: Microcosm, scope: Object) {
    super()

    this._repo = repo
    this._scope = scope
    this._bindings = []
    this._subscriptions = {}
    this._patch = {}
    this._publish = this._publish.bind(this)
    this._pendingUpdate = null

    this.value = {}
  }

  bind(bindings: Object) {
    this._bindings.length = 0

    for (var key in bindings) {
      let callback = bindings[key]

      if (isObservable(callback)) {
        this._track(key, callback)
      } else {
        this._bindings.push({ key, callback })
      }
    }

    if (this._bindings.length) {
      this._repo.on('change', this._compute, this)
    } else {
      this._repo.off('change', this._compute, this)
    }

    this._compute()
    this._commit(merge(this.value, this._patch))
  }

  /**
   * Dispose a model, removing all _subscriptions and unsubscribing
   * from the repo.
   */
  teardown() {
    for (var key in this._subscriptions) {
      this._subscriptions[key].unsubscribe()
    }

    this._empty()

    this._repo.off('change', this._compute, this)
  }

  /* Private ------------------------------------------------------ */

  _enqueue() {
    if (!this._pendingUpdate) {
      this._pendingUpdate = this._repo.history.updater(this._publish)
    }
  }

  _set(key: string, value: *) {
    if (this.value[key] !== value) {
      this._patch[key] = value
      this._enqueue()
    }
  }

  _publish() {
    let next = merge(this.value, this._patch)

    this._emit('will-change', next, this._patch)
    this._commit(next)
    this._emit('change', next)
  }

  _commit(value: Answer) {
    this.value = value
    this._empty()
  }

  _empty() {
    this._patch = {}

    if (this._pendingUpdate) {
      this._pendingUpdate.cancel()
      this._pendingUpdate = null
    }
  }

  /**
   * Track an observable. Sending updates to a given key.
   */
  _track(key: string, observable: *) {
    let last = this._subscriptions[key]
    let next = observable.subscribe(value => this._set(key, value))

    this._subscriptions[key] = next

    if (last) {
      last.unsubscribe()
    }
  }

  /**
   * Run through each invokable binding, recomputing the model for
   * their associated keys.
   */
  _compute() {
    let dirty = false
    for (var i = 0; i < this._bindings.length; i++) {
      var { key, callback } = this._bindings[i]

      var value = invoke(callback, this._repo, this._scope)

      if (this.value[key] !== value) {
        this._patch[key] = value
        dirty = true
      }
    }

    if (dirty) {
      this._enqueue()
    }
  }
}
