import Emitter from './emitter'
import tag from './tag'

import {
  inherit
} from './utils'

let uid = 0

/**
 * Actions represent the state of an action. As actions change, their
 * associated history coordinates with Microcosm instances to update
 * state. Create an Action using `Microcosm::push`
 * @constructor
 * @param {Function|string} command
 * @param {string} [status] Starting status
 */
export default function Action (command, status) {
  Emitter.call(this)

  this.id = uid++
  this.command = tag(command)
  this.timestamp = Date.now()
  this.children = []

  if (status) {
    console.assert(this[status], 'Unexpected task status ' + status)
    this[status]()
  }
}

inherit(Action, Emitter, {
  status   : 'inactive',
  payload  : undefined,
  disabled : false,
  complete : false,
  parent   : null,
  next     : null,

  /**
   * Open state. The action has started, but has received no response.
   * @param {*} [nextPayload]
   */
  open (nextPayload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('open', false)

    return this
  },

  /**
   * Update state. The action has received an update, such as loading progress.
   * @param {*} [nextPayload]
   */
  update (nextPayload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('update', false)

    return this
  },

  /**
   * Resolved state. The action has completed successfully.
   * @param {*} [nextPayload]
   */
  resolve (nextPayload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('resolve', true)

    return this
  },

  /**
   * Failure state. The action did not complete successfully.
   * @param {*} [nextPayload]
   */
  reject (nextPayload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('reject', true)

    return this
  },

  /**
   * Cancelled state. The action was halted, like aborting an HTTP
   * request.
   * @param {*} [nextPayload]
   */
  cancel (nextPayload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('cancel', true)

    return this
  },

  /**
   * Subscribe to when an action opens.
   * @param {Function} callback
   * @param {*} [scope]
   */
  onOpen (callback, scope) {
    this._callOrSubscribeOnce('open', callback, scope)
    return this
  },

  /**
   * Subscribe to when a action updates
   * @param {Function} callback
   * @param {*} [scope]
   */
  onUpdate (callback, scope) {
    return this.on('update', callback, scope)
  },

  /**
   * Subscribe to when a action resolves
   * @param {Function} callback
   * @param {*} [scope]
   */
  onDone (callback, scope) {
    this._callOrSubscribeOnce('resolve', callback, scope)
    return this
  },

  /**
   * Subscribe to when a action rejects
   * @param {Function} callback
   * @param {*} [scope]
   */
  onError (callback, scope) {
    this._callOrSubscribeOnce('reject', callback, scope)
    return this
  },

  /**
   * Subscribe to when a action is cancelled
   * @param {Function} callback
   * @param {*} [scope]
   */
  onCancel (callback, scope) {
    this._callOrSubscribeOnce('cancel', callback, scope)
    return this
  },

  /**
   * @param {string} type
   * @returns {boolean}
   */
  is (type) {
    return this.command[this.status] === this.command[type]
  },

  /**
   * @param {boolean} [silent]
   * @return {this}
   */
  toggle (silent) {
    this.disabled = !this.disabled

    if (!silent) {
      this._emit('change', this)
    }

    return this
  },

  /**
   * @param {?Function} pass
   * @param {Function} [fail]
   * @returns {Promise}
   */
  then (pass, fail) {
    return new Promise((resolve, reject) => {
      this.onDone(resolve)
      this.onError(reject)
    }).then(pass, fail)
  },

  /**
   * Is this action connected?
   * @return {boolean}
   */
  isDisconnected () {
    return !this.parent
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
   * Add action to the list of children
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
   * Connect the parent node to the next node. Removing this action
   * from history.
   */
  remove () {
    console.assert(!this.isDisconnected(), 'Action has already been removed.')

    this.parent.abandon(this)

    this.removeAllListeners()
  },

  /**
   * Remove a child action
   * @param {Action} child Action to remove
   * @private
   */
  abandon (child) {
    let index = this.children.indexOf(child)

    if (index >= 0) {
      this.children.splice(index, 1)
      child.parent = null
    }

    // If the action is the oldest child of a parent, pass
    // on the lead role to the next child.
    if (this.next === child) {
      this.lead(child.next)
    }
  },

  /**
   * Reset the payload
   * @private
   */
  _setPayload (payload) {
    if (arguments.length) {
      this.payload = payload
    }
  },

  /**
   * Change the status of the action
   * @private
   * @param {string} status The next action status
   * @param {boolean} complete Should the action be complete?
   */
  _setStatus (status, complete) {
    if (!this.complete) {
      this.status = status
      this.complete = complete

      this._emit('change', this)
      this._emit(status, this.payload)
    }
  },

  /**
   * If an action is already a given status, invoke the
   * provided callback. Otherwise setup a one-time listener
   * @private
   * @param {string} status
   * @param {Function} callback
   * @param {*} scope
   */
  _callOrSubscribeOnce (status, callback, scope) {
    if (!!callback) {
      console.assert(typeof callback === 'function',
                     `Expected a function when subscribing to ${status}` +
                     `instead got ${typeof callback}`)

      if (this.is(status)) {
        callback.call(scope, this.payload)
      } else {
        this.once(status, callback, scope)
      }
    }
  }

})

Object.defineProperty(Action.prototype, 'type', {
  get () {
    return this.command[this.status]
  }
})
