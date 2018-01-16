/**
 * Taken from zen-observable, with specific implimentation notes for Microcosm
 * @flow
 */

import { getSymbol } from './symbols'
import { Subject } from './subject'
import { set } from './data'
import { noop } from './empty'

function getObservable(obj) {
  return obj && obj[getSymbol('observable')]
}

export class Subscription {
  constructor(observer, subscriber, origin) {
    this._cleanup = undefined
    this._observer = observer
    this._origin = origin

    observer.start(this)

    if (this._observer === undefined) {
      return
    }

    observer = new SubscriptionObserver(this)

    try {
      // Call the subscriber function
      let cleanup = subscriber.call(undefined, observer)

      // The return value must be undefined, null, a subscription object, or a function
      if (cleanup != null) {
        if (typeof cleanup.unsubscribe === 'function') {
          cleanup = cleanup.unsubscribe
        } else if (typeof cleanup !== 'function') {
          throw new TypeError(cleanup + ' is not a function')
        }

        this._cleanup = cleanup
      }
    } catch (error) {
      // If an error occurs during startup, then attempt to send the error
      // to the observer
      observer.error(error)
      return
    }

    // If the stream is already finished, then perform cleanup
    if (this._observer === undefined) {
      cleanupSubscription(this)
    }
  }

  get unsubscribe() {
    return handleUnsubscribe.bind(null, this)
  }
}

export class SubscriptionObserver {
  constructor(subscription) {
    this.next = handleNext.bind(null, subscription)
    this.complete = handleComplete.bind(null, subscription)
    this.error = handleError.bind(null, subscription)
    this.unsubscribe = subscription.unsubscribe
  }
}

export function genObserver(config) {
  if (config == null) {
    throw new TypeError('Unable to subscribe via ' + config)
  }

  let observer = {
    start: noop,
    next: noop,
    error: noop,
    complete: noop,
    unsubscribe: noop,
    cleanup: noop
  }

  if (typeof config === 'function') {
    observer.next = arguments[0]

    if (arguments.length > 1) {
      observer.error = arguments[1]
    }

    if (arguments.length > 2) {
      observer.complete = arguments[2]
    }
  } else {
    for (var key in observer) {
      if (config[key]) {
        observer[key] = config[key]
      }
    }
  }

  return observer
}

function purge(subscriptions) {
  subscriptions.forEach(s => s.unsubscribe())
  subscriptions.length = 0
}

export class Observable {
  constructor(subscriber) {
    this._subscriber = subscriber
    this._subscriptions = new Set()
  }

  subscribe(config) {
    let subscription = new Subscription(
      genObserver(config),
      this._subscriber,
      this
    )

    this._subscriptions.add(subscription)

    return subscription
  }

  get unsubscribe() {
    return purge.bind(null, this._subscriptions)
  }

  [getSymbol('observable')]() {
    return this
  }

  static of() {
    return new Observable(observer => {
      let last = undefined

      for (var i = 0; i < arguments.length; ++i) {
        last = arguments[i]
        observer.next(last)
      }

      observer.complete()
    })
  }

  static wrap(source) {
    if (source && typeof source === 'object') {
      if (getObservable(source)) {
        return source
      }

      if (typeof source.then === 'function') {
        return fromPromise(source)
      }
    }

    return new Observable(observer => {
      observer.next(source)
      observer.complete()
    })
  }

  static hash(obj) {
    if (getObservable(obj)) {
      return obj
    }

    let subject = new Subject()

    if (obj == null || typeof obj !== 'object') {
      subject.next(obj)
      subject.complete()
      return subject
    }

    if (typeof obj.then === 'function') {
      subject.subscribe(fromPromise(obj).subscribe(subject))
      return subject
    }

    let keys = Object.keys(obj)
    let payload = Array.isArray(obj) ? [] : {}
    let jobs = keys.length

    function complete() {
      if (--jobs <= 0) {
        subject.complete()
      }
    }

    function assign(key, value) {
      payload = set(payload, key, value)

      if (payload !== subject.payload) {
        subject.next(payload)
      }
    }

    for (var i = 0, len = keys.length; i < len; i++) {
      let key = keys[i]

      let subscription = Observable.wrap(obj[key]).subscribe({
        next: assign.bind(null, key),
        complete: complete,
        error: subject.error
      })

      subject.subscribe(subscription)
    }

    return subject
  }
}

function cleanupSubscription(subscription) {
  let cleanup = subscription._cleanup

  subscription._origin._subscriptions.delete(subscription)

  if (cleanup) {
    // Drop the reference to the cleanup function so that we won't call it
    // more than once
    subscription._cleanup = undefined

    // Call the cleanup function
    cleanup()
  }
}

function handleNext(subscription, value) {
  if (subscription._observer) {
    return subscription._observer.next(value)
  }
}

function handleError(subscription, value) {
  let observer = subscription._observer

  if (observer === undefined) {
    throw value
  }

  subscription._observer = undefined

  observer.error(value)
  observer.cleanup()

  cleanupSubscription(subscription)
}

function handleComplete(subscription) {
  let observer = subscription._observer

  // If the stream is closed, then return undefined
  if (observer === undefined) {
    return undefined
  }

  subscription._observer = undefined

  observer.complete()
  observer.cleanup()

  cleanupSubscription(subscription)
}

function handleUnsubscribe(subscription) {
  let observer = subscription._observer

  if (observer === undefined) {
    return
  }

  subscription._observer = undefined

  observer.unsubscribe()
  observer.cleanup()

  cleanupSubscription(subscription)
}

function fromPromise(promise) {
  return new Observable(observer => {
    promise
      .then(observer.next)
      .then(observer.complete)
      .catch(observer.error)
  })
}
