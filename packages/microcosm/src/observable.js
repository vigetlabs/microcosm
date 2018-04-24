/**
 * Inspired by zen-observable, with specific notes for Microcosm
 * @flow
 */

import assert from 'assert'
import { observable } from './symbols'
import { noop, EMPTY_OBJECT } from './empty'

interface Unsubscribable {
  unsubscribe(): any;
}

type Cleanup = Unsubscribable | (() => any)
type Subscriber = (observer: *) => ?Cleanup

export class Observer {
  _config: Object

  constructor(next: *, error?: *, complete?: *) {
    if (typeof next === 'function') {
      this._config = { next, error, complete }
    } else {
      assert(next, 'Unable to subscribe to ' + String(next))
      this._config = next || EMPTY_OBJECT
    }
  }

  get next(): (payload?: *) => any {
    return this._config.next || noop
  }

  get error(): (error?: *) => any {
    return this._config.error || noop
  }

  get complete(): () => any {
    return this._config.complete || noop
  }

  get cancel(): (reason?: *) => any {
    return this._config.cancel || noop
  }
}

const ClosedObserver = new Observer({})

export class SubscriptionObserver {
  _subscription: Subscription

  constructor(subscription: Subscription) {
    this._subscription = subscription
  }

  get next(): (value?: *) => void {
    return handleNext.bind(null, this._subscription)
  }

  get complete(): () => void {
    return handleComplete.bind(null, this._subscription)
  }

  get error(): (error?: *) => void {
    return handleError.bind(null, this._subscription)
  }

  get cancel(): (reason?: *) => void {
    return handleCancel.bind(null, this._subscription)
  }
}

export class Subscription implements Unsubscribable {
  _cleanup: ?() => void
  _observer: Observer
  _origin: *

  constructor(observer: Observer, subscriber: Subscriber, origin: any) {
    this._cleanup = undefined
    this._observer = observer
    this._origin = origin

    var subscriptionObserver = new SubscriptionObserver(this)

    try {
      // Call the subscriber function
      let cleanup = subscriber.call(undefined, subscriptionObserver)

      // The return value must be undefined, null, a subscription object, or a function
      if (cleanup != null) {
        if (typeof cleanup.unsubscribe === 'function') {
          cleanup = cleanup.unsubscribe
        } else if (typeof cleanup !== 'function') {
          throw new TypeError(String(cleanup) + ' is not a function')
        }

        this._cleanup = cleanup
      }
    } catch (error) {
      // If an error occurs during startup, then attempt to send the error
      // to the observer
      subscriptionObserver.error(error)
    } finally {
      if (this.closed) {
        cleanupSubscription(this)
      }
    }
  }

  close(): void {
    this._observer = ClosedObserver
  }

  get closed(): boolean {
    return this._observer == ClosedObserver
  }

  get unsubscribe(): * {
    return handleUnsubscribe.bind(null, this)
  }
}

export class Observable {
  _subscriber: Function
  _subscriptions: Set<Subscription>

  constructor(subscriber: Subscriber) {
    this._subscriber = subscriber
    this._subscriptions = new Set()
  }

  subscribe(
    next: Object | Function,
    error?: Function,
    complete?: Function
  ): Subscription {
    let subscription = new Subscription(
      new Observer(next, error, complete),
      this._subscriber,
      this
    )

    this._subscriptions.add(subscription)

    return subscription
  }

  get cancel(): (reason?: *) => void {
    return reason => {
      this._subscriptions.forEach(s => handleCancel(s, reason))
    }
  }

  map(fn: (*) => *, scope: any): Observable {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function')
    }

    return new Observable(observer => {
      return this.subscribe({
        next(value) {
          try {
            value = fn.call(scope, value)
          } catch (e) {
            return observer.error(e)
          }
          observer.next(value)
        },
        error: observer.error,
        complete: observer.complete
      })
    })
  }

  // $FlowFixMe - Flow does not support computed keys
  [observable]() {
    return this
  }

  static of() {
    return new Observable(observer => {
      for (var i = 0; i < arguments.length; ++i) {
        observer.next(arguments[i])
      }

      observer.complete()
    })
  }

  static wrap(source: *): Observable {
    if (source && typeof source === 'object') {
      let builder = getObservable(source)

      if (builder) {
        return builder.call(source)
      }

      if (typeof source.then === 'function') {
        return Observable.fromPromise(source)
      }
    }

    return new Observable(observer => {
      observer.next(source)
      observer.complete()
    })
  }

  static fromPromise(promise: Promise<*>): Observable {
    return new Observable(observer => {
      promise
        .then(observer.next)
        .then(observer.complete)
        .catch(observer.error)
    })
  }
}

export function getObservable(obj: any) {
  return obj && obj[observable]
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

function handleNext(subscription: Subscription, value?: *) {
  if (subscription._observer) {
    subscription._observer.next(value)
  }
}

function handleComplete(subscription: Subscription): void {
  let observer = subscription._observer

  subscription.close()

  observer.complete()

  cleanupSubscription(subscription)
}

function handleError(subscription: Subscription, error?: *): void {
  if (subscription.closed) {
    // TODO: this doesn't feel right. If a user double errors() we
    // should warn, but not raise. It should mean that they did
    // something wrong
    throw error
  }

  let observer = subscription._observer

  subscription.close()

  observer.error(error)

  cleanupSubscription(subscription)
}

function handleUnsubscribe(subscription: Subscription): void {
  if (subscription.closed) {
    return
  }

  subscription.close()
  cleanupSubscription(subscription)
}

function handleCancel(subscription: Subscription, reason: ?*): void {
  if (subscription._observer) {
    subscription._observer.cancel(reason)
  }

  handleUnsubscribe(subscription)
}
