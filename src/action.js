import Emitter from './emitter'
import tag from './tag'
import History from './history'
import { inherit } from './utils'

/**
 * Actions encapsulate the process of resolving an action creator. Create an
 * action using `Microcosm::push`:
 * @constructor
 * @extends {Emitter}
 */
export default function Action (behavior, history) {
  Emitter.call(this)

  this.behavior = tag(behavior)
  this.history = history || new History()
}

inherit(Action, Emitter, {
  type       : null,
  payload    : undefined,
  disabled   : false,
  disposable : false,
  parent     : null,
  first      : null,
  next       : null,
  sibling    : null,

  /**
   * Given a string or State constant, determine if the `state` bitmask for
   * the action includes the provided type.
   * @private
   */
  is (type) {
    return this.type === this.behavior[type]
  },

  /**
   * Set the action state to "open", then set a payload if provided. Triggers
   * the "open" event.
   */
  open (payload) {
    if (!this.disposable) {
      this.type = this.behavior.open

      if (arguments.length > 0) {
        this.payload = payload
      }

      this.history.reconcile(this)

      this._emit('open', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "loading", then set a payload if provided.
   * Triggers the "update" event.
   */
  update (payload) {
    if (!this.disposable) {
      this.type = this.behavior.loading

      if (arguments.length > 0) {
        this.payload = payload
      }

      this.history.reconcile(this)

      this._emit('update', this.payload)
    }

    return this
  },

  send () {
    if (typeof console !== 'undefined') {
      console.warn('`send` was deprecated in 11.6.0.',
                   'Please use `update` instead.',
                   '`send` will be removed in 12.0.0.')
    }

    return this.update.apply(this, arguments)
  },

  /**
   * Set the action state to "error" and marks the action for clean up, then
   * set a payload if provided. Triggers the "error" event.
   */
  reject (payload) {
    if (!this.disposable) {
      this.type = this.behavior.error
      this.disposable = true

      if (arguments.length > 0) {
        this.payload = payload
      }

      this.history.reconcile(this)

      this._emit('error', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "done" and marks the action for clean up, then set
   * a payload if provided. Triggers the "done" event.
   */
  resolve (payload) {
    if (!this.disposable) {
      this.type = this.behavior.done
      this.disposable = true

      if (arguments.length > 0) {
        this.payload = payload
      }

      this.history.reconcile(this)

      this._emit('done', this.payload)
    }

    return this
  },

  /**
   * Set the action state to "cancelled" and marks the action for clean up,
   * then set a payload if provided. Triggers the "cancel" event.
   */
  cancel (payload) {
    if (!this.disposable) {
      this.type = this.behavior.cancelled
      this.disposable = true

      if (arguments.length > 0) {
        this.payload = payload
      }

      this.history.reconcile(this)

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

    this.history.invalidate()

    return this
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
  }

})

/**
 * Get all child actions. Used by the Microcosm debugger to visualize history.
 */
Object.defineProperty(Action.prototype, 'children', {
  get () {
    let children = []
    let node = this.first

    while (node) {
      children.unshift(node)
      node = node.sibling
    }

    return children
  }
})
