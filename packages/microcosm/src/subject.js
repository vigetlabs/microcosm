// @flow

import { Observable, genObserver } from './observable'
import { observable } from './symbols'
import { noop, EMPTY_SUBSCRIPTION } from './empty'
import { merge } from 'data'

function send(observers, message, value) {
  observers.forEach(observer => observer[message](value))
}

export class Subject {
  meta: { tag: *, status: string }
  payload: *
  disabled: boolean
  _observers: Set<*>
  _observable: Observable

  constructor(payload?: *, meta?: *) {
    this.meta = merge({ tag: null, status: 'unstarted' }, meta)
    this.payload = payload
    this.disabled = false

    this.meta.status = 'start'

    this._observers = new Set()

    this._observable = new Observable(observer => {
      this._observers.add(observer)
      return () => this._observers.delete(observer)
    })
  }

  get status(): string {
    return this.meta.status
  }

  get completed(): boolean {
    return this.status === 'complete'
  }

  get cancelled(): boolean {
    return this.status === 'cancel'
  }

  get closed(): boolean {
    return this.errored || this.completed || this.cancelled
  }

  get errored(): boolean {
    return this.status === 'error'
  }

  get next(): * {
    if (this.closed) {
      return noop
    }

    return value => {
      this.meta.status = 'next'

      if (value != null) {
        this.payload = value
      }

      send(this._observers, 'next', value)
    }
  }

  get complete(): * {
    return value => {
      this.meta.status = 'complete'

      if (value != null) {
        this.payload = value
      }

      send(this._observers, 'complete', value)
    }
  }

  get error(): * {
    return error => {
      this.payload = error
      this.meta.status = 'error'

      send(this._observers, 'error', error)
    }
  }

  get cancel(): * {
    return reason => {
      this.payload = reason
      this.meta.status = 'cancel'

      send(this._observers, 'cancel', reason)
    }
  }

  toggle() {
    this.disabled = !this.disabled
  }

  subscribe(next: *) {
    let observer = genObserver(...arguments)

    if (this.closed) {
      observer.start(this.payload)

      if (this.completed) {
        observer.next(this.payload)
      }

      observer[this.status](this.payload)
    } else {
      return new Observable(observer => {
        if (this.meta.status === 'next') {
          observer.next(this.payload)
        }
        return this._observable.subscribe(observer)
      }).subscribe(observer)
    }

    return EMPTY_SUBSCRIPTION
  }

  then(pass: *, fail: *): Promise<*> {
    return new Promise((resolve, reject) => {
      this.subscribe({
        complete: () => resolve(this.payload),
        error: () => reject(this.payload),
        cancel: () => resolve(this.payload)
      })
    }).then(pass, fail)
  }

  // $FlowFixMe - Flow doesn't understand computed keys :-/
  [observable]() {
    return this
  }

  toString(): string {
    return this.meta.tag || 'Subject'
  }

  toJSON(): Object {
    return {
      payload: this.payload,
      status: this.meta.status,
      tag: this.toString()
    }
  }
}
