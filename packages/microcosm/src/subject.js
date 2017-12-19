// @flow

import tag from './tag'
import { Observable } from './observable'
import { getSymbol } from './utils'
import { INACTIVE, START, NEXT, COMPLETE, ERROR } from './lifecycle'

export class Subject {
  constructor(id) {
    this.tag = tag(id).toString()
    this.status = INACTIVE
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
      return Observable.of(this.payload).subscribe(...arguments)
    }

    if (this.status === INACTIVE) {
      this.status = START
    }

    return this._observable.subscribe(...arguments)
  }

  reduce() {
    if (this.closed) {
      return Observable.of(this.payload).reduce(...arguments)
    }

    return this._observable.reduce(...arguments)
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

  then(pass, fail) {
    return new Promise((complete, error) => {
      this.subscribe({ complete, error })
    }).then(pass, fail)
  }

  valueOf() {
    return this.payload
  }

  toString() {
    return this.tag
  }

  [getSymbol('observable')]() {
    return this
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
  if (this.closed) {
    return Observable.of(this.payload)[method](...args)
  }

  return this._observable[method](...args)
}

function handleNext(subject, value) {
  if (subject.closed) {
    console.warn('This Subject has already closed.')
    return
  }

  subject.status = NEXT

  if (arguments.length > 1) {
    subject.payload = value
  }

  send(subject._observers, NEXT, subject.payload)
}

function handleError(subject, error) {
  subject.status = ERROR
  subject.closed = true

  send(subject._observers, ERROR, error)
}

function handleComplete(subject, value) {
  subject.status = COMPLETE
  subject.closed = true

  if (arguments.length > 1) {
    subject.payload = value
  }

  send(subject._observers, 'complete', subject.payload)
}
