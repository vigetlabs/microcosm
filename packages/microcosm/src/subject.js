import { Observable } from './observable'
import { getSymbol } from './utils'

export class Subject {
  constructor() {
    this.closed = false

    this._value = null
    this._observers = new Set()
    this._observable = new Observable(manage.bind(null, this._observers))
  }

  subscribe() {
    if (this.closed) {
      return Observable.of(this._value).subscribe(...arguments)
    }

    return this._observable.subscribe(...arguments)
  }

  reduce() {
    if (this.closed) {
      return Observable.of(this._value).reduce(...arguments)
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

function manage(observers, observer) {
  observers.add(observer)
  return observers.delete.bind(observers, observer)
}

function delegate(subject, method, args) {
  if (this.closed) {
    return Observable.of(this._value)[method](...args)
  }

  return this._observable[method](...args)
}

function handleNext(subject, value) {
  if (subject.closed) {
    console.warn('This Subject has already closed.')
    return
  }

  if (arguments.length > 1) {
    subject._value = value
  }

  send(subject._observers, 'next', subject._value)
}

function handleError(subject, error) {
  subject.closed = true
  send(subject._observers, 'error', error)
}

function handleComplete(subject, value) {
  subject.closed = true

  if (arguments.length > 1) {
    subject._value = value
  }

  send(subject._observers, 'complete', subject._value)
}
