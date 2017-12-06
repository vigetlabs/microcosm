/**
 * Taken from zen-observable, with specific implimentation notes for Microcosm
 */

function hasSymbol(name) {
  return typeof Symbol === 'function' && Boolean(Symbol[name])
}

function getSymbol(name) {
  return hasSymbol(name) ? Symbol[name] : '@@' + name
}

function getSpecies(obj) {
  let ctor = obj.constructor
  if (ctor !== undefined) {
    ctor = ctor[getSymbol('species')]
    if (ctor === null) {
      ctor = undefined
    }
  }
  return ctor !== undefined ? ctor : Observable
}

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

function subscriptionClosed(subscription) {
  return subscription._observer === undefined
}

function cleanupFromSubscription(subscription) {
  return () => {
    subscription.unsubscribe()
  }
}

class Subscription {
  constructor(observer, subscriber) {
    console.assert(Object(observer) === observer, 'Observer must be an object')

    this._cleanup = undefined
    this._observer = observer

    if (observer.start) {
      observer.start.call(observer, this)
    }

    if (subscriptionClosed(this)) {
      return
    }

    observer = new SubscriptionObserver(this)

    try {
      // Call the subscriber function
      let cleanup = subscriber.call(undefined, observer)

      // The return value must be undefined, null, a subscription object, or a function
      if (cleanup != null) {
        if (typeof cleanup.unsubscribe === 'function') {
          cleanup = cleanupFromSubscription(cleanup)
        } else if (typeof cleanup !== 'function') {
          throw new TypeError(cleanup + ' is not a function')
        }

        this._cleanup = cleanup
      }
    } catch (e) {
      // If an error occurs during startup, then attempt to send the error
      // to the observer
      observer.error(e)
      return
    }

    // If the stream is already finished, then perform cleanup
    if (subscriptionClosed(this)) {
      cleanupSubscription(this)
    }
  }

  get closed() {
    return subscriptionClosed(this)
  }

  unsubscribe() {
    if (subscriptionClosed(subscription)) {
      return
    }

    subscription._observer = undefined

    cleanupSubscription(subscription)
  }
}

class SubscriptionObserver {
  constructor(subscription) {
    this._subscription = subscription
  }

  get closed() {
    return subscriptionClosed(this._subscription)
  }

  next(value) {
    let subscription = this._subscription

    // If the stream is closed, then return undefined
    if (subscriptionClosed(subscription)) {
      return undefined
    }

    let observer = subscription._observer

    // If the observer doesn't support "next", then return undefined
    return observer.next ? observer.next.call(observer, value) : undefined
  }

  error(value) {
    let subscription = this._subscription

    // If the stream is closed, throw the error to the caller
    if (subscriptionClosed(subscription)) {
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
    if (subscriptionClosed(subscription)) return undefined

    let observer = subscription._observer
    subscription._observer = undefined

    try {
      let m = observer.complete

      // If the sink does not support "complete", then return undefined
      value = m ? m.call(observer, value) : undefined
    } catch (e) {
      try {
        cleanupSubscription(subscription)
      } finally {
        throw e
      }
    }

    cleanupSubscription(subscription)
    return value
  }

  cancel(value) {
    let subscription = this._subscription

    // If the stream is closed, then return undefined
    if (subscriptionClosed(subscription)) {
      return undefined
    }

    let observer = subscription._observer
    subscription._observer = undefined

    try {
      let m = observer.cancel

      // If the sink does not support "complete", then return undefined
      value = m ? m.call(observer, value) : undefined
    } catch (e) {
      try {
        cleanupSubscription(subscription)
      } finally {
        throw e
      }
    }

    cleanupSubscription(subscription)

    return value
  }
}

export class Observable {
  constructor(subscriber) {
    // The stream subscriber must be a function
    if (typeof subscriber !== 'function') {
      throw new TypeError('Observable initializer must be a function')
    }

    this._subscriber = subscriber
  }

  subscribe(observer, ...args) {
    if (typeof observer === 'function') {
      observer = {
        next: observer,
        error: args[0],
        complete: args[1],
        cancel: args[2]
      }
    }

    return new Subscription(observer, this._subscriber)
  }

  [getSymbol('observable')]() {
    return this
  }

  static of(...items) {
    return new Observable(observer => {
      for (let i = 0; i < items.length; ++i) {
        observer.next(items[i])

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
