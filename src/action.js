import Emitter from './emitter'
import coroutine from './action/coroutine'
import tag from './tag'
import * as States from './action/states'
import { inherit } from './utils'

/**
 * Actions encapsulate the process of resolving an action creator. Create an
 * action using `Microcosm::push`:
 */
export default function Action (behavior, history) {
  Emitter.apply(this, arguments)

  if (process.env.NODE_ENV !== 'production') {
    console.assert(typeof behavior === 'string' || typeof behavior === 'function',
                   'Action expected string or function, instead got:', behavior)
  }

  this.type = null
  this.behavior = tag(behavior)
  this.state = States.disabled
  this.payload = null

  this.history = history
  this.parent = null
  this.sibling = null
}

inherit(Action, Emitter, {

  /**
   * Given a string or State constant, determine if the `state` bitmask for
   * the action includes the provided type.
   * @private
   */
  is (code) {
    return (this.state & code) === code
  },

  /**
   * Evaluate the action by invoking the action's behavior with provided
   * parameters. Then pass that value into the `coroutine` function, which will
   * update the state of the action as it processes.
   */
  execute (params) {
    coroutine(this, this.behavior.apply(this, params))

    return this
  },

  /**
   * Trigger history reconciliation if associated with a history
   * @private
   */
  reconcile() {
    if (this.history) {
      this.history.reconcile(this)
    }

    return this
  },

  /**
   * If defined, sets the payload for the action and triggers a "change" event.
   */
  set (state, payload) {
    // Ignore set if the action is already disposed.
    if (this.is(States.disposable)) {
      return false
    }

    this.state = state
    this.type = States.getType(this)

    if (payload != undefined) {
      this.payload = payload
    }

    this.reconcile()

    return true
  },

  /**
   * Set the action state to "open", then set a payload if provided. Triggers
   * the "open" event.
   */
  open (payload) {
    if (this.set(States.open, payload)) {
      this._emit('open', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "loading", then set a payload if provided.
   * Triggers the "update" event.
   */
  send (payload) {
    if (this.set(States.loading, payload)) {
      this._emit('update', payload)
    }

    return this
  },

  /**
   * Set the action state to "error" and marks the action for clean up, then
   * set a payload if provided. Triggers the "error" event.
   */
  reject (payload) {
    if (this.set(States.error | States.disposable, payload)) {
      this._emit('error', payload)
    }

    return this
  },

  /**
   * Set the action state to "done" and marks the action for clean up, then set
   * a payload if provided. Triggers the "done" event.
   */
  resolve (payload) {
    if (this.set(States.done | States.disposable, payload)) {
      this._emit('done', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "cancelled" and marks the action for clean up,
   * then set a payload if provided. Triggers the "cancel" event.
   */
  cancel () {
    if (this.set(States.cancelled | States.disposable, null)) {
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
    this.state ^= States.disabled
    this.type = States.getType(this)

    return this.reconcile()
  },

  /**
   * Listen to failure. If the action has already failed, it will execute the
   * provided callback, otherwise it will wait and trigger upon the "error"
   * event.
   */
  onError (callback, scope) {
    if (typeof callback !== 'function') {
      return this
    }

    if (this.is(States.error)) {
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
    if (typeof callback !== 'function') {
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
    if (typeof callback !== 'function') {
      return this
    }

    if (this.is(States.done)) {
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
    if (typeof callback !== 'function') {
      return this
    }

    if (this.is(States.cancelled)) {
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
   * Cleanup an action that has been disconnected from its history
   */
  teardown() {
    // Disconnect some pointers to help GC clean up
    this.parent = null
    this.sibling = null
    this.history = null

    if (this.next) {
      this.next.parent = null
    }
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
