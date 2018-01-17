// @flow

import { Observable, genObserver } from './observable'
import { getSymbol } from './symbols'
import { noop, EMPTY_SUBSCRIPTION } from './empty'

function send(observers, message, value) {
  observers.forEach(observer => {
    if (!observer.closed) {
      observer[message](value)
    }
  })
}

export class Subject {
  constructor(payload, meta) {
    this.meta = meta || {}
    this.payload = payload
    this.closed = false
    this.errored = false
    this.disabled = false
    this.cancelled = false

    this.meta.status = 'start'

    this._observers = new Set()

    this._observable = new Observable(observer => {
      this._observers.add(observer)
      return () => this._observers.delete(observer)
    })
  }

  get next() {
    if (this.closed) {
      return noop
    }

    return value => {
      this.payload = value
      this.meta.status = 'next'

      send(this._observers, 'next', value)
    }
  }

  get complete() {
    return () => {
      this.closed = true
      this.meta.status = 'complete'

      send(this._observers, 'complete')
    }
  }

  get error() {
    return error => {
      this.closed = true
      this.errored = true
      this.payload = error
      this.meta.status = 'error'

      send(this._observers, 'error', error)
    }
  }

  get unsubscribe() {
    return reason => {
      this.closed = true
      this.cancelled = true
      this.payload = reason
      this.meta.status = 'unsubscribe'

      this._observable.unsubscribe()
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
      observer.unsubscribe(this.payload)
    } else if (this.closed) {
      observer.start(this.payload)
      observer.next(this.payload)
      observer.complete()
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
        error: reject,
        unsubscribe: resolve
      })
    }).then(pass, fail)
  }

  [getSymbol('observable')]() {
    return this
  }

  toString() {
    return this.meta.tag || 'subject'
  }

  toJSON() {
    return {
      payload: this.payload,
      status: this.meta.status,
      tag: this.meta.tag
    }
  }
}
