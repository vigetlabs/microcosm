import Emitter from './emitter'
import coroutine from './coroutine'
import tag from './tag'
import { inherit } from './utils'

// What types are disposable?
const DISPOSABLE = {
  cancelled : true,
  done      : true,
  error     : true
}

/**
 * Actions encapsulate the process of resolving an action creator. Create an
 * action using `Microcosm::push`:
 * @constructor
 * @extends {Emitter}
 */
export default function Action (behavior) {
  Emitter.call(this)
  this.behavior = tag(behavior)
}

inherit(Action, Emitter, {
  type      : null,
  payload   : undefined,
  disabled  : false,
  diposable : false,
  parent    : null,
  sibling   : null,

  /**
   * Given a string or State constant, determine if the `state` bitmask for
   * the action includes the provided type.
   * @private
   */
  is (type) {
    return this.type === this.behavior[type]
  },

  /**
   * Evaluate the action by invoking the action's behavior with provided
   * parameters. Then pass that value into the `coroutine` function, which will
   * update the state of the action as it processes.
   */
  execute (params, repo) {
    coroutine(this, this.behavior.apply(this, params), repo)

    return this
  },

  /**
   * If defined, sets the payload for the action and triggers a "change" event.
   */
  set (type, payload) {
    // Ignore set if the action is already disposed.
    if (this.disposable) {
      return false
    }

    this.type = this.behavior[type]
    this.disposable = DISPOSABLE.hasOwnProperty(type)

    if (arguments.length > 1) {
      this.payload = payload
    }

    this._emit('change', this)

    return true
  },

  /**
   * Set the action state to "open", then set a payload if provided. Triggers
   * the "open" event.
   */
  open (...params) {
    if (this.set('open', ...params)) {
      this._emit('open', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "loading", then set a payload if provided.
   * Triggers the "update" event.
   */
  send (...params) {
    if (this.set('loading', ...params)) {
      this._emit('update', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "error" and marks the action for clean up, then
   * set a payload if provided. Triggers the "error" event.
   */
  reject (...params) {
    if (this.set('error', ...params)) {
      this._emit('error', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "done" and marks the action for clean up, then set
   * a payload if provided. Triggers the "done" event.
   */
  resolve (...params) {
    if (this.set('done', ...params)) {
      this._emit('done', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "cancelled" and marks the action for clean up,
   * then set a payload if provided. Triggers the "cancel" event.
   */
  cancel (...params) {
    if (this.set('cancelled', ...params)) {
      this._emit('cancel', this.payload)
    }

    return this
  },

  /**
   * Toggles the disabled state, where the action will not dispatch. This is
   * useful in the Microcosm debugger to quickly enable/disable actions.
   * Triggers the "change" event.
   */
  toggle () {
    this.disabled = !this.disabled

    return this._emit('change', this)
  },

  /**
   * Listen to failure. If the action has already failed, it will execute the
   * provided callback, otherwise it will wait and trigger upon the "error"
   * event.
   */
  onError (callback, scope) {
    if (!callback) {
      return this
    }

    if (this.is('error')) {
      callback.call(scope, this.payload)
    } else {
      this.once('error', callback, scope)
    }

    return this
  },

  /**
   * Listen to progress. Wait and trigger a provided callback on the "update" event.
   */
  onUpdate (callback, scope) {
    if (!callback) {
      return this
    }

    this.on('update', callback, scope)

    return this
  },

  /**
   * Listen for completion. If the action has already completed, it will
   * execute the provided callback, otherwise it will wait and trigger upon the
   * "done" event.
   */
  onDone (callback, scope) {
    if (!callback) {
      return this
    }

    if (this.is('done')) {
      callback.call(scope, this.payload)
    } else {
      this.once('done', callback, scope)
    }

    return this
  },

  /**
   * Listen for cancel. If the action has already cancelled, it will execute
   * the provided callback, otherwise it will wait and trigger upon the
   * "cancel" event.
   */
  onCancel (callback, scope) {
    if (!callback) {
      return this
    }

    if (this.is('cancelled')) {
      callback.call(scope, this.payload)
    } else {
      this.once('cancel', callback, scope)
    }

    return this
  },

  /**
   * For interop with promises. Returns a promise that resolves or rejects
   * based on the action's resolution.
   */
  then (pass, fail) {
    return new Promise((resolve, reject) => {
      this.onDone(resolve)
      this.onError(reject)
    }).then(pass, fail)
  },

  /**
   * Cleanup an action that has been disconnected from its history.
   */
  teardown () {
    this.parent = null
    this.sibling = null

    if (this.next) {
      this.next.parent = null
    }

    // Remove generic change events to free from history reconciliation
    this.off('change')
  }

})

/**
 * Get all child actions. Used by the Microcosm debugger to visualize history.
 */
Object.defineProperty(Action.prototype, 'children', {
  get () {
    let start = this.next
    let nodes = []

    while (start) {
      nodes.push(start)
      start = start.sibling
    }

    return nodes
  }
})
