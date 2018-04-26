/**
 * @fileoverview A subject is a type of observable that is useful when:
 *
 * 1. You need a value right away.
 * 2. A job should run only once, but be subscribed to many times.
 *
 * Unlike Observables, when you subscribe to a Subject you immediately
 * receive a "next" callback with the current payload. This is important
 * for a couple of use cases that require immediate access to state:
 *
 * 1. Domains
 * 2. Actions
 * 3. Presenter view models
 *
 * @flow
 */
import assert from 'assert'
import { type Microcosm } from './microcosm'
import {
  Observable,
  type SubscriptionObserver,
  type Cleanup,
  type Subscriber
} from './observable'
import { set, merge } from './data'
import { isPromise, isObservable, isObject, isPlainObject } from './type-checks'

export class Subject extends Observable {
  meta: { key: *, status: string, origin: Microcosm }
  payload: any
  disabled: boolean

  _observers: SubscriptionObserver[]
  _subscriber: Subscriber

  constructor(payload?: *, meta?: Object) {
    super()

    this.meta = merge({ key: 'subject', status: 'start' }, meta)
    this.payload = payload
    this.disabled = false

    this._subscriber = this._multicast
    this._observers = []
  }

  _multicast(observer: SubscriptionObserver): Cleanup {
    this._observers.push(observer)

    switch (this.status) {
      case 'next':
        observer.next(this.payload)
        break
      case 'complete':
        observer.next(this.payload)
        observer.complete()
        break
      case 'error':
        observer.error(this.payload)
        break
      case 'cancel':
        observer.cancel()
        break
    }

    return remove.bind(null, this._observers, observer)
  }

  get status(): string {
    return this.meta.status
  }

  get closed(): boolean {
    switch (this.status) {
      case 'error':
      case 'complete':
      case 'cancel':
        return true
      default:
        return false
    }
  }

  get next() {
    return update.bind(null, this, 'next')
  }

  get complete() {
    return update.bind(null, this, 'complete')
  }

  get error() {
    return update.bind(null, this, 'error')
  }

  get cancel() {
    return update.bind(null, this, 'cancel')
  }

  get clear() {
    return () => {
      this.meta.status = 'start'
      this.payload = null

      for (var i = 0; i < this._observers.length; i++) {
        this._observers[i].unsubscribe()
      }
    }
  }

  then(pass: *, fail: *): Promise<*> {
    return new Promise((resolve, reject) => {
      this.subscribe(null, reject, resolve, resolve)
    })
      .then(() => this.payload)
      .then(pass, fail)
  }

  toString(): string {
    return this.meta.key
  }

  toJSON(): Object {
    return {
      payload: this.payload,
      status: this.meta.status,
      key: this.toString()
    }
  }

  valueOf() {
    return this.payload
  }

  static hash(obj: *): Subject {
    let isArray = Array.isArray(obj)
    let isPojo = isPlainObject(obj)

    if (!isArray && !isPojo) {
      return Subject.from(obj)
    }

    let payload = isArray ? [] : {}
    let subject = new Subject(payload)
    let building = true
    let jobs = 0

    function taskFinished() {
      if (--jobs <= 0) {
        if (!building) {
          subject.complete(payload)
        }
      }
    }

    function assign(key: string, value: *): void {
      // $FlowFixMe - Signature of set() is too strict
      payload = set(payload, key, value)

      if (payload !== subject.payload) {
        subject.next(payload)
      }
    }

    for (var key in obj) {
      let value = obj[key]

      if (!isObject(value)) {
        payload = set(payload, key, value)
        continue
      }

      jobs += 1

      if (value instanceof Subject) {
        payload = set(payload, key, value.payload)
      }

      let subscription = Subject.hash(value).subscribe({
        next: assign.bind(null, key),
        error: subject.error,
        complete: taskFinished,
        cancel: taskFinished
      })

      subject.subscribe({ cancel: subscription.unsubscribe })
    }

    if (payload !== subject.payload) {
      subject.next(payload)
    }

    building = false

    if (jobs <= 0) {
      subject.complete()
    }

    return subject
  }

  static from(source: *): Subject {
    if (source instanceof Subject) {
      return source
    }

    if (isObservable(source)) {
      return fromObservable(source)
    }

    if (isPromise(source)) {
      return fromPromise(source)
    }

    return Subject.of(source)
  }

  // $FlowFixMe This function enumerates on variable arguments
  static of() {
    let subject = new Subject()

    for (var i = 0; i < arguments.length; i++) {
      subject.next(arguments[i])
    }

    subject.complete()

    return subject
  }
}

function fromPromise(promise: Promise<*>): Subject {
  let subject = new Subject()

  promise
    .then(subject.next)
    .then(() => subject.complete())
    .catch(subject.error)

  return subject
}

function fromObservable(observable: Observable): Subject {
  let subject = new Subject()
  observable.subscribe(subject)
  return subject
}

function remove(list: *[], item: *): void {
  let index = list.indexOf(item)

  if (index >= 0) {
    list.splice(index, -1)
  } else {
    assert(false, 'Attempted to remove an observer that was never added.')
  }
}

function update(subject: Subject, status: string, value: *): void {
  if (subject.closed) {
    return
  }

  subject.meta.status = status

  if (arguments.length > 2) {
    subject.payload = value
  }

  subject._observers.forEach(observer => {
    switch (status) {
      case 'next':
        return observer.next(subject.payload)
      case 'error':
        return observer.error(subject.payload)
      case 'complete':
        return observer.complete()
      case 'cancel':
        return observer.cancel()
    }
  })
}
