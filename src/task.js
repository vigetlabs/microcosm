import Emitter from './emitter'
import tag from './tag'

let uid = 0

/**
 * @fileoverview Tasks document the status of actions as they process.
 */
export default class Task extends Emitter {

  /**
   * @param {Function|string} action
   * @param {string} [status]
   */
  constructor (action, status) {
    super()

    this.id = uid++
    this.action = tag(action)
    this.command = this.action  // For backwards compatibility
    this.timestamp = Date.now()
    this.children = []
    this.status = 'inactive'
    this.payload = undefined
    this.disabled = false
    this.disposable = false
    this.parent = null
    this.next =  null

    if (status) {
      console.assert(this[status], 'Unexpected task status ' + status)
      this[status]()
    }
  }

  get type () {
    return this.action[this.status]
  }

  /**
   * Open state. The task has started, but has received no response.
   * @param {*} payload
   */
  open (payload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('open', false)

    return this
  }

  /**
   * Update state. The task has received an update, such as loading progress.
   * @param {*} payload
   */
  update (payload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('update', false)

    return this
  }

  /**
   * Resolved state. The task has completed successfully.
   * @param {*} payload
   */
  resolve (payload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('resolve', true)

    return this
  }

  /**
   * Failure state. The task did not complete successfully.
   * @param {*} payload
   */
  reject (payload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('reject', true)

    return this
  }

  /**
   * Cancelled state. The task was halted, like aborting an HTTP request.
   * @param {*} payload
   */
  cancel (payload) {
    this._setPayload.apply(this, arguments)
    this._setStatus('cancel', true)

    return this
  }

  /**
   * Subscribe to when a task opens.
   * @param {Function} callback
   * @param {*} [scope]
   */
  onOpen (callback, scope) {
    this._invokeOrWait('open', callback, scope)
    return this
  }

  /**
   * Subscribe to when a task updates
   * @param {Function} callback
   * @param {*} [scope]
   */
  onUpdate (callback, scope) {
    return this.on('update', callback, scope)
  }

  /**
   * Subscribe to when a task resolves
   * @param {Function} callback
   * @param {*} [scope]
   */
  onDone (callback, scope) {
    this._invokeOrWait('resolve', callback, scope)
    return this
  }

  /**
   * Subscribe to when a task rejects
   * @param {Function} callback
   * @param {*} [scope]
   */
  onError (callback, scope) {
    this._invokeOrWait('reject', callback, scope)
    return this
  }

  /**
   * Subscribe to when a task is cancelled
   * @param {Function} callback
   * @param {*} [scope]
   */
  onCancel (callback, scope) {
    this._invokeOrWait('cancel', callback, scope)
    return this
  }

  /**
   * @param {string} type
   * @returns {boolean}
   */
  is (type) {
    return this.command[this.status] === this.command[type]
  }

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
  }

  /**
   * Turn this task into a promise.
   * @return {Promise}
   */
   toPromise () {
     return new Promise((resolve, reject) => {
       this.onDone(resolve)
       this.onError(reject)
     })
   }

  /**
   * Turn this task into a promise, then add a chain. This allows for seamless
   * interop with Promise-based contracts.
   * @param {?Function} pass
   * @param {?Function} fail
   * @returns {Promise}
   */
  then (pass, fail) {
    return this.toPromise().then(pass, fail)
  }

  /**
   * Remove the grandparent of this task, cutting off history.
   */
  prune () {
    console.assert(this.parent, 'Expected task to have parent')
    this.parent.parent = null
  }

  /**
   * Set the next task after this one in the historical tree of
   * tasks.
   * @param {?Task} child Task to follow this one
   */
  lead (child) {
    this.next = child

    if (child) {
      this.adopt(child)
    }
  }

  /**
   * Add task to the list of children
   * @param {Task} child Task to include in child list
   */
  adopt (child) {
    let index = this.children.indexOf(child)

    if (index < 0) {
      this.children.push(child)
    }

    child.parent = this
  }

  /**
   * Remove a child task
   * @param {Task} child Task to remove
   */
  abandon (child) {
    let index = this.children.indexOf(child)

    if (index >= 0) {
      this.children.splice(index, 1)
      child.parent = null
    }
  }

  /**
   * Remove this task from history by connecting the parent to the next child,
   * If the oldest child of the parent, pass on the lead role to that child.
   */
  remove () {
    if (this.parent.next === this) {
      this.parent.lead(this.next)
    }

    this.parent.abandon(this)

    this.next = null
  }

  /**
   * Indicates if an task is currently connected within a history.
   * @returns {Boolean} Is the task connected to a parent?
   */
  isDisconnected () {
    return this.parent == null
  }

  /**
   * Update the payload, but only if given arguments.
   * @private
   */
  _setPayload (payload) {
    if (arguments.length) {
      this.payload = payload
    }
  }

  /**
   * Change the status of the task
   * @private
   */
  _setStatus (status, disposable) {
    if (!this.disposable) {
      this.status = status
      this.disposable = disposable

      this._emit('change', this)
      this._emit(status, this.payload)
    }
  }

  /**
   * Add an event listener, but only if the action is not already in
   * the given state. Ignore falsy callbacks to improve ergonomics.
   * @param {string} status
   * @param {Function} callback
   * @param {*} [scope]
   * @private
   */
  _invokeOrWait (status, callback, scope) {
    if (!!callback) {
      if (this.is(status)) {
        callback.call(scope, this.payload)
      } else {
        this.once(status, callback, scope)
      }
    }
  }

}
