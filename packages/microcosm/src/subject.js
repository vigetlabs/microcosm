// @flow

import { Observable, genObserver } from './observable'
import { getSymbol } from './symbols'
import { noop, EMPTY_SUBSCRIPTION } from './empty'

function send(observers, message, value) {
  observers.forEach(observer => observer[message](value))
}

export class Subject {
  constructor(payload, meta) {
    this.meta = meta || {}
    this.payload = payload
    this.disabled = false

    this.meta.status = 'start'

    this._observers = new Set()

    this._observable = new Observable(observer => {
      this._observers.add(observer)
      return () => this._observers.delete(observer)
    })
  }

  get status() {
    return this.meta.status
  }

  get completed() {
    return this.status === 'complete'
  }

  get cancelled() {
    return this.status === 'cancel'
  }

  get closed() {
    return this.errored || this.completed || this.cancelled
  }

  get errored() {
    return this.status === 'error'
  }

  get next() {
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

  get complete() {
    return value => {
      this.meta.status = 'complete'

      if (value != null) {
        this.payload = value
      }

      send(this._observers, 'complete', value)
    }
  }

  get error() {
    return error => {
      this.payload = error
      this.meta.status = 'error'

      send(this._observers, 'error', error)
    }
  }

  get cancel() {
    return reason => {
      this.payload = reason
      this.meta.status = 'cancel'

      send(this._observers, 'cancel', reason)
    }
  }

  toggle() {
    this.disabled = !this.disabled
  }

  subscribe() {
    let observer = genObserver(...arguments)

    if (this.errored) {
      observer.start(this.payload)
      observer.error(this.payload)
    } else if (this.cancelled) {
      observer.start(this.payload)
      observer.cancel(this.payload)
    } else if (this.completed) {
      observer.start(this.payload)
      observer.complete(this.payload)
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

  then(pass, fail) {
    return new Promise((resolve, reject) => {
      this.subscribe({
        complete: () => resolve(this.payload),
        error: () => reject(this.payload)
      })
    }).then(pass, fail)
  }

  [getSymbol('observable')]() {
    return this
  }

  toString() {
    return this.meta.tag || 'Subject'
  }

  toJSON() {
    return {
      payload: this.payload,
      status: this.meta.status,
      tag: this.toString()
    }
  }
}
