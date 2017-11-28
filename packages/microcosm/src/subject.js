import Observable from 'zen-observable'

function send(observers, message, value) {
  Array.from(observers).forEach(function(observer) {
    if (observer.closed) {
      return
    }

    try {
      return observer[message](value)
    } catch (error) {
      setTimeout(() => { throw error }, 0)
    }
  })
}

function channel(subject, message, args) {
  if (subject.closed) {
    return Observable.of(subject.valueOf())[message](...args)
  }

  return subject._observable[message](...args)
}

class Subject {
  constructor(options) {
    let observers = new Set()

    this._value = null
    this._observers = observers

    this.closed = false

    this._observable = new Observable(function(observer) {
      observers.add(observer)

      return () => observers.delete(observer)
    })
  }

  get observable() {
    return this._observable
  }

  get observed() {
    return this._observers.size > 0
  }

  subscribe() {
    return channel(this, 'subscribe', arguments)
  }

  filter() {
    return channel(this, 'filter', arguments)
  }

  forEach() {
    return channel(this, 'forEach', arguments)
  }

  reduce() {
    return channel(this, 'reduce', arguments)
  }

  map() {
    return channel(this, 'map', arguments)
  }

  flatMap() {
    return channel(this, 'flatMap', arguments)
  }

  next(value) {
    this._value = value

    send(this._observers, 'next', value)
  }

  error(error) {
    this.closed = true
    send(this._observers, 'error', error)
  }

  complete(value) {
    this.closed = true
    send(this._observers, 'complete', value)
  }

  valueOf() {
    return this._value
  }
}

export default Subject
