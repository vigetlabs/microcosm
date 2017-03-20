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
  this.children = []

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
  next       : null,

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
   * @param {?Action} child Action to follow this one
   */
  lead (child) {
    this.next = child

    if (child) {
      this.adopt(child)
    }
  },

  /**
   * Add an action to the list of children
   * @param {Action} child Action to include in child list
   */
  adopt (child) {
    let index = this.children.indexOf(child)

    if (index < 0) {
      this.children.push(child)
    }

    child.parent = this
  },

  /**
   * Remove a child action
   * @param {Action} child Action to remove
   */
  abandon (child) {
    let index = this.children.indexOf(child)

    if (index >= 0) {
      this.children.splice(index, 1)
      child.parent = null
    }
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

    this.parent.abandon(this)

    // Remove all relations
    this.next = null
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

Object.defineProperty(Action.prototype, 'type', {
  get () {
    return this.command[this.status]
  }
})

/**
 * Generate action methods for each action state
 */
Object.keys(STATES).forEach(function (status) {
  const { once, disposable, listener } = STATES[status]

  /**
   * Create a method to update the action status. For example:
   * action.done({ id: 'earth' })
   */
  Action.prototype[status] = function (payload) {
    if (!this.disposable) {
      this.status = status
      this.disposable = disposable

      if (arguments.length) {
        this.payload = payload
      }

      this.history.reconcile(this)

      this._emit(status, this.payload)
    }

    return this
  }

  /**
   * Create a method to subscribe to a status. For example:
   * action.onDone({ id: 'earth' })
   */
  Action.prototype[listener] = function (callback, scope) {
    if (callback) {
      if (once && this.status === status) {
        callback.call(scope, this.payload)
      } else {
        this.once(status, callback, scope)
      }
    }

    return this
  }

})
