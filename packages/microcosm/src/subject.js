// @flow

import { tag } from './tag'
import { Observable } from './observable'
import { getSymbol } from './symbols'
import { EMPTY_OBJECT } from './empty'
import {
  INACTIVE,
  START,
  NEXT,
  COMPLETE,
  ERROR,
  UNSUBSCRIBE
} from './lifecycle'

let uid = 0

export class Subject {
  constructor(id, meta) {
    this.id = uid++
    this.tag = String(tag(id))
    this.status = INACTIVE
    this.meta = meta || EMPTY_OBJECT

    this.payload = null
    this.closed = false
    this.disabled = false

    this._observers = new Set()
    this._observable = new Observable(multicast.bind(null, this._observers))
  }

  toggle() {
    this.disabled = !this.disabled
  }

  subscribe() {
    if (this.closed) {
      return new Observable(observer => {
        observer.next(this.payload)
        observer[this.status](this.payload)
      }).subscribe(...arguments)
    }

    if (this.status === INACTIVE) {
      this.status = START
    }

    return this._observable.subscribe(...arguments)
  }

  reduce() {
    return delegate(this, 'reduce', arguments)
  }

  map() {
    return delegate(this, 'map', arguments)
  }

  filter() {
    return delegate(this, 'filter', arguments)
  }

  flatMap() {
    return delegate(this, 'flatMap', arguments)
  }

  get next() {
    return handleNext.bind(null, this)
  }

  get error() {
    return handleError.bind(null, this)
  }

  get complete() {
    return handleComplete.bind(null, this)
  }

  get unsubscribe() {
    return handleUnsubscribe.bind(null, this)
  }

  map(fn) {
    if (this.closed) {
      return Observable.of(this.payload).map(fn)
    }

    return this._observable.map(fn)
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

  valueOf() {
    return this.payload
  }

  toString() {
    return this.tag
  }

  every(callback) {
    let bound = callback.bind(null, this)

    return this.subscribe({
      [START]: bound,
      [NEXT]: bound,
      [COMPLETE]: bound,
      [ERROR]: bound,
      [UNSUBSCRIBE]: bound
    })
  }

  [getSymbol('observable')]() {
    return this
  }

  toJSON() {
    return {
      id: this.id,
      tag: this.tag,
      status: this.status,
      payload: this.payload
    }
  }
}

function send(observers, message, value) {
  observers.forEach(observer => {
    if (!observer.closed) {
      observer[message](value)
    }
  })
}

function multicast(observers, observer) {
  observers.add(observer)
  return observers.delete.bind(observers, observer)
}

function delegate(subject, method, args) {
  let observable = this._observable

  if (this.closed) {
    observable = Observable.of(this.payload)
  }

  return observable[method](...args)
}

function handleNext(subject, value) {
  if (subject.closed) {
    return
  }

  subject.status = NEXT
  subject.payload = value

  send(subject._observers, NEXT, subject.payload)
}

function handleError(subject, error) {
  subject.status = ERROR
  subject.closed = true
  subject.payload = error

  send(subject._observers, ERROR, error)
}

function handleComplete(subject) {
  subject.status = COMPLETE
  subject.closed = true

  send(subject._observers, COMPLETE)
}

function handleUnsubscribe(subject) {
  subject.status = UNSUBSCRIBE
  subject.closed = true
  subject._observable.unsubscribe()
}
