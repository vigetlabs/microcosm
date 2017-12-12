/**
 * Taken from zen-observable, with specific implimentation notes for Microcosm
 */

import { getSymbol } from './utils'

function cleanupSubscription(subscription) {
  // Assert:  observer._observer is undefined
  let cleanup = subscription._cleanup

  if (!cleanup) {
    return
  }

  // Drop the reference to the cleanup function so that we won't call it
  // more than once
  subscription._cleanup = undefined

  // Call the cleanup function
  cleanup()
}

class Subscription {
  constructor(observer, subscriber) {
    console.assert(Object(observer) === observer, 'Observer must be an object')

    this._cleanup = undefined
    this._observer = observer

    if (observer.start) {
      observer.start.call(observer, this)
    }

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
          cleanup = cleanup.unsubscribe()
        } else if (typeof cleanup !== 'function') {
          throw new TypeError(cleanup + ' is not a function')
        }

        this._cleanup = cleanup
      }
    } catch (e) {
      console.error('error', e)
      // If an error occurs during startup, then attempt to send the error
      // to the observer
      observer.error(e)
      return
    }

    // If the stream is already finished, then perform cleanup
    if (this._observer === undefined) {
      cleanupSubscription(this)
    }
  }

  unsubscribe() {
    if (this._observer === undefined) {
      return
    }

    this._observer = undefined

    cleanupSubscription(this)
  }
}

class SubscriptionObserver {
  constructor(subscription) {
    this._subscription = subscription
  }

  next(value) {
    let subscription = this._subscription

    // If the stream is closed, then return undefined
    if (subscription._observer === undefined) {
      return undefined
    }

    let observer = subscription._observer

    // If the observer doesn't support "next", then return undefined
    return observer.next ? observer.next.call(observer, value) : undefined
  }

  error(value) {
    let subscription = this._subscription

    // If the stream is closed, throw the error to the caller
    if (subscription._observer === undefined) {
      throw value
    }

    let observer = subscription._observer
    subscription._observer = undefined

    try {
      let m = observer.error

      // If the sink does not support "error", then throw the error to the caller
      if (!m) throw value

      value = m.call(observer, value)
    } catch (e) {
      console.error('error', e)

      try {
        cleanupSubscription(subscription)
      } finally {
        throw e
      }
    }

    cleanupSubscription(subscription)
    return value
  }

  complete(value) {
    let subscription = this._subscription

    // If the stream is closed, then return undefined
    if (subscription._observer === undefined) {
      return undefined
    }

    let observer = subscription._observer
    subscription._observer = undefined

    if (observer.complete) {
      console.assert(
        typeof observer.complete === 'function',
        '"complete" must be a function, instead got %s',
        value
      )

      try {
        value = observer.complete(value)
      } catch (e) {
        console.error('error', e)

        try {
          cleanupSubscription(subscription)
        } finally {
          throw e
        }
      }
    } else {
      value = undefined
    }

    cleanupSubscription(subscription)
    return value
  }
}

export class Observable {
  constructor(subscriber) {
    console.assert(
      typeof subscriber === 'function',
      'Observable initializer must be a function'
    )
    this._subscriber = subscriber
  }

  subscribe(observer) {
    if (typeof observer === 'function') {
      observer = {
        next: arguments[0],
        error: arguments[1],
        complete: arguments[2]
      }
    }

    return new Subscription(observer, this._subscriber)
  }

  [getSymbol('observable')]() {
    return this
  }

  static of() {
    return new Observable(observer => {
      for (let i = 0; i < arguments.length; ++i) {
        observer.next(arguments[i])

        if (observer.closed) {
          return
        }
      }

      observer.complete()
    })
  }

  static [getSymbol('species')]() {
    return this
  }
}
