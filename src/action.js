/**
 * @fileoverview Actions encapsulate the process of resolving an
 * action creator. Create an action using `Microcosm::push`:
 * @flow
 */

import Emitter, { type Callback } from './emitter'
import tag from './tag'
import { uid } from './utils'
import assert from 'assert'

type ActionUpdater = (payload?: mixed) => *
type Revision = { status: string, payload: *, timestamp: number }

const ResolutionMap = {
  inactive: false,
  open: false,
  update: false,
  resolve: true,
  reject: true,
  cancel: true
}

class Action extends Emitter {
  id: string
  command: Tagged
  status: Status
  payload: any
  disabled: boolean
  parent: ?Action
  next: ?Action
  complete: boolean
  timestamp: number
  children: Action[]
  revisions: Revision[]

  constructor(command: Command | Tagged, status: ?Status) {
    super()

    this.id = uid('action')
    this.command = tag(command)
    this.status = 'inactive'
    this.payload = undefined
    this.disabled = false
    this.complete = false
    this.parent = null
    this.next = null
    this.timestamp = Date.now()
    this.children = []
    this.revisions = []

    if (status) {
      this.setState(status)
    }
  }

  get type(): string {
    return this.command[this.status] || ''
  }

  get open(): ActionUpdater {
    return this.setState.bind(this, 'open')
  }

  get update(): ActionUpdater {
    return this.setState.bind(this, 'update')
  }

  get resolve(): ActionUpdater {
    return this.setState.bind(this, 'resolve')
  }

  get reject(): ActionUpdater {
    return this.setState.bind(this, 'reject')
  }

  get cancel(): ActionUpdater {
    return this.setState.bind(this, 'cancel')
  }

  onOpen(callback: Callback, scope?: Object): this {
    this._callOrSubscribeOnce('open', callback, scope)
    return this
  }

  onUpdate(callback: Callback, scope?: Object): this {
    if (callback) {
      this.on('update', callback, scope)
    }

    return this
  }

  onDone(callback: Callback, scope?: Object): this {
    this._callOrSubscribeOnce('resolve', callback, scope)
    return this
  }

  onError(callback: Callback, scope?: Object): this {
    this._callOrSubscribeOnce('reject', callback, scope)
    return this
  }

  onCancel(callback: Callback, scope?: Object): this {
    this._callOrSubscribeOnce('cancel', callback, scope)
    return this
  }

  is(type: Status): boolean {
    return this.command[this.status] === this.command[type]
  }

  toggle(silent?: boolean) {
    this.disabled = !this.disabled

    if (!silent) {
      this._emit('change', this)
    }

    return this
  }

  /**
   * Set up an action such that it depends on the result of another
   * series of actions.
   */
  link(actions: Action[]): this {
    let outstanding = actions.length
    let answers = []

    if (actions.length === 0) {
      return this.resolve(answers)
    }

    actions.forEach(action => {
      let onResolve = answer => {
        answers[actions.indexOf(action)] = answer
        outstanding -= 1

        if (outstanding <= 0) {
          this.resolve(answers)
        }
      }

      action.onDone(onResolve)
      action.onCancel(onResolve)
      action.onError(this.reject)
    })

    return this
  }

  then(pass?: *, fail?: *): Promise<*> {
    return new Promise((resolve, reject) => {
      this.onDone(resolve)
      this.onError(reject)
    }).then(pass, fail)
  }

  isDisconnected(): boolean {
    return !this.parent
  }

  /**
   * Remove the grandparent of this action, cutting off history.
   */
  prune() {
    if (this.parent) {
      this.parent.parent = null
    } else {
      assert(false, 'Unable to prune action. It is already disconnected.')
    }
  }

  /**
   * Set the next action after this one in the historical tree of
   * actions.
   */
  lead(child: ?Action) {
    this.next = child

    if (child) {
      this.adopt(child)
    }
  }

  /**
   * Add action to the list of children
   */
  adopt(child: Action) {
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
    if (this.parent) {
      this.parent.abandon(this)
    } else {
      assert(false, 'Action has already been removed.')
    }

    this.removeAllListeners()
  }

  /**
   * Remove a child action
   */
  abandon(child: Action) {
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
   */
  _callOrSubscribeOnce(status: Status, callback: Callback, scope: ?Object) {
    if (callback) {
      assert(
        typeof callback === 'function',
        `Expected a function when subscribing to ${status}` +
          `instead got ${typeof callback}`
      )

      if (this.is(status)) {
        callback.call(scope, this.payload)
      } else {
        this.once(status, callback, scope)
      }
    }
  }

  setState(status: Status, payload: mixed) {
    if (this.complete) {
      return this
    }

    this.status = status
    this.complete = ResolutionMap[status]

    // Check arguments, we want to allow payloads that are undefined
    if (arguments.length > 1) {
      this.payload = payload
    }

    this.revisions.push({
      status: this.status,
      payload: this.payload,
      timestamp: Date.now()
    })

    this._emit('change', this)
    this._emit(status, this.payload)

    return this
  }

  toString() {
    return this.command.toString()
  }

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      type: this.type,
      payload: this.payload,
      disabled: this.disabled,
      children: this.children,
      revisions: this.revisions,
      next: this.next && this.next.id
    }
  }
}

export default Action
