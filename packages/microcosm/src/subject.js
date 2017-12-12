import { Observable } from './observable'

function send(observers, message, value) {
  Array.from(observers).forEach(function(observer) {
    if (observer.closed) {
      return
    }

    try {
      return observer[message](value)
    } catch (error) {
      setTimeout(() => {
        throw error
      }, 0)
    }
  })
}

function manage(observers, observer) {
  observers.add(observer)
  return observers.delete.bind(observers, observer)
}

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

  next(value) {
    if (this.closed) {
      console.warn('This Subject has already closed.')
      return
    }

    if (arguments.length) {
      this._value = arguments[0]
    }

    send(this._observers, 'next', this._value)
  }

  error(error) {
    this.closed = true
    send(this._observers, 'error', error)
  }

  complete(value) {
    this.closed = true

    if (arguments.length) {
      this._value = arguments[0]
    }

    send(this._observers, 'complete', this._value)
  }

  then(pass, fail) {
    return new Promise((resolve, reject) => {
      this.subscribe({
        complete: () => resolve(this._value),
        error: reject
      })
    }).then(pass, fail)
  }
}
