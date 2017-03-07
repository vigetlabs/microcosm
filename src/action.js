import Emitter from './emitter'
import History from './history'
import tag from './tag'

import {
  inherit
} from './utils'

import {
  ACTION_STATES
} from './constants'

/**
 * Actions encapsulate the process of resolving an action creator. Create an
 * action using `Microcosm::push`:
 */
export default function Action (command, status, history) {
  Emitter.call(this)

  this.history = history || new History()

  this.id = this.history.getId()
  this.command = tag(command)
  this.timestamp = Date.now()

  if (status) {
    this.setStatus(status)
  }
}

inherit(Action, Emitter, {
  status     : 'inactive',
  payload    : undefined,
  disabled   : false,
  disposable : false,
  parent     : null,
  first      : null,
  next       : null,
  sibling    : null,

  is (type) {
    return this.command[this.status] === this.command[type]
  },

  toggle () {
    this.disabled = !this.disabled

    this.history.reconcile(this)

    return this
  },

  then (pass, fail) {
    return new Promise((resolve, reject) => {
      this.onDone(resolve)
      this.onError(reject)
    }).then(pass, fail)
  },

  setStatus (status) {
    console.assert(ACTION_STATES[status], 'Invalid action status "' + status + '"')

    this.status = status
    this.disposable = ACTION_STATES[status].disposable
  },

  prune () {
    console.assert(this.parent, 'Expected action to have parent')
    this.parent.parent = null
  }

})

/**
 * Generate action methods for each action state
 */
Object.keys(ACTION_STATES).forEach(function (key) {
  const { once, listener } = ACTION_STATES[key]

  /**
   * Create a method to update the action status. For example:
   * action.done({ id: 'earth' })
   */
  Action.prototype[key] = function (payload) {
    if (!this.disposable) {
      this.setStatus(key)

      if (arguments.length) {
        this.payload = payload
      }

      this.history.reconcile(this)

      this._emit(key, this.payload)
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
