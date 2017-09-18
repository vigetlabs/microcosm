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

type Answer = { [string]: * }

export default class Model extends Emitter {
  _scope: Object
  _repo: Microcosm
  _bindings: *
  _subscriptions: { [string]: * }
  _pendingUpdate: ?Job
  _publish: () => void
  _patch: Answer
  _watching: Boolean
  _ready: Boolean

  value: Answer

  constructor(repo: Microcosm, scope: Object) {
    super()

    this._repo = repo
    this._scope = scope
    this._bindings = {}
    this._subscriptions = {}
    this._patch = {}
    this._publish = this._publish.bind(this)
    this._pendingUpdate = null
    this._watching = false
    this._ready = false

    this.value = {}
  }

  bind(bindings: Object) {
    let nextBindings = null
    let recompute = false

    for (var key in bindings) {
      let callback = bindings[key]

      if (isObservable(callback)) {
        this._track(key, callback)
      } else if (isCallable(callback)) {
        if (this._bindings[key] !== callback) {
          recompute = true
          nextBindings = nextBindings || {}
          nextBindings[key] = callback
        }
      } else if (this.value[key] !== callback) {
        recompute = true
        this._patch[key] = callback
      }
    }

    if (nextBindings) {
      this._bindings = nextBindings
      this._watchRepo()
    } else {
      this._ignoreRepo()
    }

    if (recompute) {
      this._compute()
    }

    if (this._ready) {
      this._publish()
    } else {
      this._ready = true
      this._commit(merge(this.value, this._patch))
    }
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

  _watchRepo() {
    if (!this._watching) {
      this._repo.on('change', this._compute, this)
      this._watching = true
    }
  }

  _ignoreRepo() {
    if (this._watching) {
      this._repo.off('change', this._compute, this)
      this._watching = false
    }
  }

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

    if (next !== this.value) {
      this._emit('will-change', next, this._patch)
      this._commit(next)
      this._emit('change', next)
    }
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
   * Run through each callable binding, recomputing the model for
   * their associated keys.
   */
  _compute() {
    let dirty = false

    for (var key in this._bindings) {
      var callback = this._bindings[key]
      var value = callback.call(this._scope, this._repo.state, this._repo)

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
