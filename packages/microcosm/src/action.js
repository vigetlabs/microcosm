/**
 * @fileoverview Actions encapsulate the process of resolving an
 * action creator. Create an action using `Microcosm::push`:
 * @flow
 */

import coroutine from './coroutine'
import Emitter, { type Callback } from './emitter'
import tag from './tag'
import { uid } from './utils'

type ActionUpdater = (payload?: mixed) => *
type Revision = { status: string, payload: *, timestamp: number }

const ResolutionMap = {
  inactive: false,
  open: false,
  update: false,
  loading: false,
  done: true,
  resolve: true,
  error: true,
  reject: true,
  cancel: true,
  cancelled: true
}

class Action extends Emitter {
  id: string
  command: Function
  status: Status
  payload: any
  disabled: boolean
  parent: ?Action
  next: ?Action
  complete: boolean
  timestamp: number
  children: Action[]
  revisions: Revision[]
  origin: Microcosm

  constructor(command: string | Command, status: ?Status, origin: Microcosm) {
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
    this.origin = origin

    if (status) {
      this._setState(status)
    }
  }

  get type(): string {
    return this.command[this.status] || ''
  }

  get open(): ActionUpdater {
    return this._setState.bind(this, 'open')
  }

  get update(): ActionUpdater {
    return this._setState.bind(this, 'update')
  }

  get resolve(): ActionUpdater {
    return this._setState.bind(this, 'resolve')
  }

  get reject(): ActionUpdater {
    return this._setState.bind(this, 'reject')
  }

  get cancel(): ActionUpdater {
    return this._setState.bind(this, 'cancel')
  }

  execute(params: *[]): this {
    console.assert(
      Array.isArray(params),
      'Action.execute must receive array of arguments.'
    )

    coroutine(this, params, this.origin)

    return this
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

  onNext(callback: Callback, scope?: Object): this {
    let iterator = () => {
      let size = this.revisions.length

      if (size > 0) {
        callback.call(scope, this.revisions[size - 1])
      }

      if (this.complete) {
        this.off('change', iterator)
      }
    }

    iterator()

    this.on('change', iterator)

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

  subscribe(callbacks: Object, scope: *) {
    if (callbacks.onNext) {
      this.onNext(callbacks.onNext, scope)
    }

    if (callbacks.onOpen) {
      this.onOpen(callbacks.onOpen, scope)
    }

    if (callbacks.onUpdate) {
      this.onUpdate(callbacks.onUpdate, scope)
    }

    if (callbacks.onCancel) {
      this.onCancel(callbacks.onCancel, scope)
    }

    if (callbacks.onDone) {
      this.onDone(callbacks.onDone, scope)
    }

    if (callbacks.onError) {
      this.onError(callbacks.onError, scope)
    }
  }

  /**
   * Set up an action such that it depends on the result of another
   * series of actions.
   */
  link(actions: *): this {
    let keys = Object.keys(Object(actions))
    let outstanding = keys.length
    let answers = Array.isArray(actions) ? [] : {}

    if (keys.length <= 0) {
      return this.resolve(answers)
    }

    keys.forEach(key => {
      let action = actions[key]

      let onResolve = answer => {
        answers[key] = answer
        outstanding -= 1

        if (outstanding <= 0) {
          this.resolve(answers)
        }
      }

      action.subscribe({
        onDone: onResolve,
        onCancel: onResolve,
        onError: this.reject
      })
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
      console.assert(
        false,
        'Unable to prune action. It is already disconnected.'
      )
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
      console.assert(false, 'Action has already been removed.')
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
      console.assert(
        typeof callback === 'function',
        `Expected a function when subscribing to ${status} instead got ${typeof callback}`
      )

      if (this.is(status)) {
        callback.call(scope, this.payload)
      } else {
        this.once(status, callback, scope)
      }
    }
  }

  _setState(status: Status, payload: mixed) {
    if (this.complete === true) {
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
