import Emitter from './emitter'
import History from './history'
import tag from './tag'

import {
  inherit
} from './utils'

import {
  STATES
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

  toggle (silent) {
    this.disabled = !this.disabled

    if (!silent) {
      this.history.reconcile(this)
    }

    return this
  },

  then (pass, fail) {
    return new Promise((resolve, reject) => {
      this.onDone(resolve)
      this.onError(reject)
    }).then(pass, fail)
  },

  setStatus (status) {
    console.assert(STATES[status], 'Invalid action status "' + status + '"')

    this.status = status
    this.disposable = STATES[status].disposable
  },

  /**
   * Remove the grandparent of this action, cutting off history.
   */
  prune () {
    console.assert(this.parent, 'Expected action to have parent')
    this.parent.parent = null
  },

  /**
   * Set the next action after this one in the historical tree of
   * actions.
   * @param {Action} child Action to follow this one
   */
  lead (child) {
    this.next = child
  },

  /**
   * Set the next action after this one in the historical tree of
   * actions.
   * @param {Action} child Action to follow this one
   */
  follow (parent) {
    this.parent = parent
  },

  /**
   * Connect the parent node to the next node. Removing this action
   * from history.
   */
  remove () {
    /**
     * If an action the oldest child of a parent, pass on the lead
     * role to the next child.
     */
    if (this.parent.next === this) {
      this.parent.lead(this.next)
    }

    /**
     * If an action is a parent, give the next child to the parent of
     * this action.
     */
    if (this.next) {
      this.next.follow(this.parent)
    }

    if (this.left) {
      this.left.right = this.right
    }

    if (this.right) {
      this.right.left = this.left
    }

    // Remove all relations
    this.parent = null
    this.next = null
    this.right = null
    this.left = null
  },

  /**
   * Indicates if an action is currently connected within
   * a history.
   * @returns {Boolean} Is the action connected to a parent?
   */
  isDisconnected () {
    return this.parent == null
  }

})

/**
 * Generate action methods for each action state
 */
Object.keys(STATES).forEach(function (key) {
  const { once, listener } = STATES[key]

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
    let next = this.next

    if (next) {
      // Slide to the left..
      let node = next
      while (node) {
        children.unshift(node)
        node = node.left
      }

      // Slide to the right...
      node = next.right
      while (node) {
        children.push(node)
        node = node.right
      }
    }

    return children
  }
})
