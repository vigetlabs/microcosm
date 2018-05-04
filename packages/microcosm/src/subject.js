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

import {
  Observable,
  Observer,
  Subscription,
  type SubscriptionObserver,
  type Subscriber
} from './observable'
import { merge } from './data'
import { isPromise, isObservable } from './type-checks'

export class Subject extends Observable {
  meta: { key: *, status: string, origin: * }
  payload: any
  disabled: boolean

  _observers: Set<SubscriptionObserver>
  _subscriber: Subscriber

  constructor(payload?: *, meta?: Object) {
    super()

    this.meta = merge({ key: 'subject', status: 'start' }, meta)
    this.payload = payload
    this.disabled = false

    this._subscriber = this._multicast.bind(this)
    this._observers = new Set()
  }

  _multicast(observer: SubscriptionObserver) {
    this._observers.add(observer)

    switch (this.status) {
      case 'next':
        observer.next(this.payload, true)
        break
      case 'complete':
        observer.next(this.payload, true)
        observer.complete()
        break
      case 'error':
        observer.error(this.payload)
        break
      case 'cancel':
        observer.cancel()
        break
    }

    return this._observers.delete.bind(this._observers, observer)
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
      this._observers.forEach(observer => observer.unsubscribe())
    }
  }

  then(pass: *, fail: *): Promise<*> {
    return new Promise((resolve, reject) => {
      this.subscribe({
        error: reject,
        complete: () => resolve(this.payload),
        cancel: () => resolve(this.payload)
      })
    }).then(pass, fail)
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
