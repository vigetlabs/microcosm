import Emitter from './emitter'
import History from './history'
import tag from './tag'
import { ACTION_STATES } from './constants'
import { inherit } from './utils'

/**
 * Actions encapsulate the process of resolving an action creator. Create an
 * action using `Microcosm::push`:
 */
export default function Action (behavior, history) {
  Emitter.call(this)

  this.behavior = tag(behavior)
  this.history = history || new History()
}

inherit(Action, Emitter, {
  status     : 'inactive',
  payload    : null,
  disabled   : false,
  disposable : false,
  parent     : null,
  first      : null,
  next       : null,
  sibling    : null,

  is (type) {
    return this.behavior[this.status] === this.behavior[type]
  },

  toggle () {
    this.disabled = !this.disabled

    this.history.invalidate()

    return this
  },

  then (pass, fail) {
    return new Promise((resolve, reject) => {
      this.onDone(resolve)
      this.onError(reject)
    }).then(pass, fail)
  }

})

/**
 * Generate action methods for each action state
 */

for (var i = 0, len = ACTION_STATES.length; i < len; i++) {
  let { key, disposable, once, listener } = ACTION_STATES[i]

  /**
   * Create a method to update the action status. For example:
   * action.done({ id: 'earth' })
   */
  Action.prototype[key] = function (payload) {
    if (!this.disposable) {
      this.status = key
      this.disposable = disposable

      if (arguments.length) {
        this.payload = payload
      }

      this.history.reconcile(this)

      this.emit(key, this.payload)
    }

    return this
  }

  /**
   * Create a method to subscribe to a status. For example:
   * action.onDone({ id: 'earth' })
   */
  Action.prototype[listener] = function (callback, scope) {
    if (callback) {
      if (once && this.is(key)) {
        callback.call(scope, this.payload)
      } else {
        this.once(key, callback, scope)
      }
    }

    return this
  }
}

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
