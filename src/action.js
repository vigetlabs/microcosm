/**
 * @fileoverview Actions encapsulate the process of resolving an
 * action creator. Create an action using `Microcosm::push`:
 */

import Emitter from './emitter'
import tag from './tag'
import { isFunction } from './utils'

let uid = 0

class Action extends Emitter {
  /**
   * @param {Function|string} command
   * @param {string} [status] Starting status
   */
  constructor(command, status) {
    super()

    this.id = uid++
    this.command = tag(command)
    this.status = 'inactive'
    this.payload = undefined
    this.disabled = false
    this.complete = false
    this.parent = null
    this.next = null
    this.timestamp = Date.now()
    this.children = []

    if (status) {
      console.assert(this[status], 'Unexpected task status ' + status)
      this[status]()
    }
  }

  get type() {
    return this.command[this.status]
  }

  /**
   * Open state. The action has started, but has received no response.
   * @param {*} [nextPayload]
   */
  get open() {
    return createActionUpdater(this, 'open', false)
  }

  /**
   * Update state. The action has received an update, such as loading progress.
   * @param {*} [nextPayload]
   */
  get update() {
    return createActionUpdater(this, 'update', false)
  }

  /**
   * Resolved state. The action has completed successfully.
   * @param {*} [nextPayload]
   */
  get resolve() {
    return createActionUpdater(this, 'resolve', true)
  }

  /**
   * Failure state. The action did not complete successfully.
   * @param {*} [nextPayload]
   */
  get reject() {
    return createActionUpdater(this, 'reject', true)
  }

  /**
   * Cancelled state. The action was halted, like aborting an HTTP
   * request.
   * @param {*} [nextPayload]
   */
  get cancel() {
    return createActionUpdater(this, 'cancel', true)
  }

  /**
   * Subscribe to when an action opens.
   * @param {Function} callback
   * @param {*} [scope]
   */
  onOpen(callback, scope) {
    this._callOrSubscribeOnce('open', callback, scope)
    return this
  }

  /**
   * Subscribe to when a action updates
   * @param {Function} callback
   * @param {*} [scope]
   */
  onUpdate(callback, scope) {
    if (callback) {
      this.on('update', callback, scope)
    }

    return this
  }

  /**
   * Subscribe to when a action resolves
   * @param {Function} callback
   * @param {*} [scope]
   */
  onDone(callback, scope) {
    this._callOrSubscribeOnce('resolve', callback, scope)
    return this
  }

  /**
   * Subscribe to when a action rejects
   * @param {Function} callback
   * @param {*} [scope]
   */
  onError(callback, scope) {
    this._callOrSubscribeOnce('reject', callback, scope)
    return this
  }

  /**
   * Subscribe to when a action is cancelled
   * @param {Function} callback
   * @param {*} [scope]
   */
  onCancel(callback, scope) {
    this._callOrSubscribeOnce('cancel', callback, scope)
    return this
  }

  /**
   * @param {string} type
   * @returns {boolean}
   */
  is(type) {
    return this.command[this.status] === this.command[type]
  }

  /**
   * @param {boolean} [silent]
   * @return {this}
   */
  toggle(silent) {
    this.disabled = !this.disabled

    if (!silent) {
      this._emit('change', this)
    }

    return this
  }

  /**
   * Set up an action such that it depends on the result of another
   * series of actions.
   * @param {Array.<Action>} actions
   * @return {this}
   */
  link(actions) {
    let outstanding = actions.length

    const onResolve = () => {
      outstanding -= 1

      if (outstanding <= 0) {
        this.resolve()
      }
    }

    actions.forEach(action => {
      action.onDone(onResolve)
      action.onCancel(onResolve)
      action.onError(this.reject)
    })

    return this
  }

  /**
   * @param {?Function} pass
   * @param {Function} [fail]
   * @returns {Promise}
   */
  then(pass, fail) {
    return new Promise((resolve, reject) => {
      this.onDone(resolve)
      this.onError(reject)
    }).then(pass, fail)
  }

  /**
   * Is this action connected?
   * @return {boolean}
   */
  isDisconnected() {
    return !this.parent
  }

  /**
   * Remove the grandparent of this action, cutting off history.
   */
  prune() {
    console.assert(this.parent, 'Expected action to have parent')
    this.parent.parent = null
  }

  /**
   * Set the next action after this one in the historical tree of
   * actions.
   * @param {?Action} child Action to follow this one
   */
  lead(child) {
    this.next = child

    if (child) {
      this.adopt(child)
    }
  }

  /**
   * Add action to the list of children
   * @param {Action} child Action to include in child list
   */
  adopt(child) {
    let index = this.children.indexOf(child)

    if (index < 0) {
      this.children.push(child)
    }

    child.parent = this
  }

  /**
   * Connect the parent node to the next node. Removing this action
   * from history.
   */
  remove() {
    console.assert(!this.isDisconnected(), 'Action has already been removed.')

    this.parent.abandon(this)

    this.removeAllListeners()
  }

  /**
   * Remove a child action
   * @param {Action} child Action to remove
   * @private
   */
  abandon(child) {
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
  }

  /**
   * If an action is already a given status, invoke the
   * provided callback. Otherwise setup a one-time listener
   * @private
   * @param {string} status
   * @param {Function} callback
   * @param {*} scope
   */
  _callOrSubscribeOnce(status, callback, scope) {
    if (callback) {
      console.assert(
        isFunction(callback),
        `Expected a function when subscribing to ${status}` +
          `instead got ${callback}`
      )

      if (this.is(status)) {
        callback.call(scope, this.payload)
      } else {
        this.once(status, callback, scope)
      }
    }
  }

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      type: this.type,
      payload: this.payload,
      disabled: this.disabled,
      children: this.children,
      next: this.next && this.next.id
    }
  }
}

/**
 * Used to autobind action resolution methods.
 * @param {Action} action
 * @param {string} status
 * @param {boolean} complete
 * @return A function that will update the provided action with a new state
 * @private
 */
function createActionUpdater(action, status, complete) {
  return function(payload) {
    if (action.complete === false) {
      action.status = status
      action.complete = complete

      // Check arguments, we want to allow payloads that are undefined
      if (arguments.length > 0) {
        action.payload = payload
      }

      action._emit('change', action)
      action._emit(status, action.payload)
    }

    return action
  }
}

export default Action
