/**
 * Inspired by zen-observable, with specific notes for Microcosm
 * @flow
 */

import assert from 'assert'
import { observable } from './symbols'
import { noop } from './empty'
import { scheduler } from './scheduler'
import { isObject } from './type-checks'

// A subscription has no work in progress
const IDLE = 0
// A subscription will send, but the scheduler is not ready for it.
const BUFFERING = 1
// A subscription is processing
const WORKING = 2
// A subscription is done
const CLOSED = 4

const NEXT = 'next'
const ERROR = 'error'
const COMPLETE = 'complete'
const CANCEL = 'cancel'

export interface Unsubscribable {
  unsubscribe(): any;
}

export type Cleanup = Unsubscribable | (() => any)
export type Subscriber = (observer: *) => ?Cleanup
export type Queue = { type: string, value: * }[]

class Observer {
  next: any => void
  error: any => void
  complete: () => void
  cancel: () => void

  constructor(next: *, error?: *, complete?: *, cancel?: *) {
    if (isObject(next)) {
      this.next = next.next || noop
      this.error = next.error || noop
      this.complete = next.complete || noop
      this.cancel = next.cancel || noop
    } else {
      this.next = next || noop
      this.error = error || noop
      this.complete = complete || noop
      this.cancel = cancel || noop
    }
  }
}

export class SubscriptionObserver {
  _subscription: Subscription

  constructor(subscription: Subscription) {
    this._subscription = subscription
  }
  get next() {
    return onNotify.bind(null, this._subscription, NEXT)
  }
  get error() {
    return onNotify.bind(null, this._subscription, ERROR)
  }
  get complete() {
    return onNotify.bind(null, this._subscription, COMPLETE)
  }
  get cancel() {
    return onNotify.bind(null, this._subscription, CANCEL)
  }
  get unsubscribe() {
    return this._subscription.unsubscribe
  }
}

export class Subscription implements Unsubscribable {
  _cleanup: Cleanup
  _observer: Observer
  _state: number
  _queue: Queue

  constructor(observer: Observer, subscriber: Subscriber, origin: *) {
    this._state = IDLE
    this._cleanup = noop
    this._queue = []
    this._observer = observer

    let subscriptionObserver = new SubscriptionObserver(this)

    try {
      // Call the subscriber function
      this._cleanup = subscriber.call(origin, subscriptionObserver) || noop
    } catch (error) {
      subscriptionObserver.error(error)
    }

    if (this._state === IDLE) {
      this._state = WORKING
    }
  }

  get closed(): boolean {
    return this._state === CLOSED
  }

  get unsubscribe(): * {
    return disposeSubscription.bind(null, this)
  }
}

export class Observable {
  _subscriber: SubscriptionObserver => ?Cleanup

  constructor(subscriber?: Subscriber) {
    this._subscriber = subscriber || noop
  }

  subscribe(next: *, error?: *, complete?: *, cancel?: *): Subscription {
    let observer = new Observer(next, error, complete, cancel)

    return new Subscription(observer, this._subscriber, this)
  }

  map(fn: (*) => *, scope: any): Observable {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function')
    }

    return new Observable(observer => {
      return this.subscribe(
        value => observer.next(fn.call(scope, value)),
        observer.error,
        observer.complete,
        observer.cancel
      )
    })
  }

  every(fn: (subject: this) => void, scope: any): * {
    let dispatch = fn.bind(scope, this)

    return this.subscribe({
      next: dispatch,
      error: dispatch,
      complete: dispatch,
      cancel: dispatch
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
}

function disposeSubscription(subscription: Subscription) {
  closeSubscription(subscription)
  cleanupSubscription(subscription)
}

const ClosedObserver = new Observer()

function closeSubscription(subscription: Subscription): void {
  subscription._observer = ClosedObserver
  subscription._queue.length = 0
  subscription._state = CLOSED
}

function cleanupSubscription(subscription: Subscription): void {
  let cleanup = subscription._cleanup

  // Drop the reference to the cleanup function so that we won't call it
  // more than once
  subscription._cleanup = noop

  if (typeof cleanup === 'function') {
    cleanup()
  } else if (cleanup instanceof Subscription) {
    cleanup.unsubscribe()
  }
}

function flushSubscription(subscription: Subscription): void {
  let queue = subscription._queue

  subscription._queue = []
  subscription._state = WORKING

  for (let i = 0; i < queue.length; i++) {
    if (subscription.closed) {
      break
    }

    notifySubscription(subscription, queue[i].type, queue[i].value)
  }

  subscription._state = IDLE
}

function notifySubscription(subscription: *, type: *, value: *) {
  let observer = subscription._observer

  // This is what triggers subscription callbacks
  try {
    switch (type) {
      case NEXT:
        observer.next(value)
        break
      case ERROR:
        closeSubscription(subscription)
        observer.error(value)
        break
      case COMPLETE:
        closeSubscription(subscription)
        observer.complete()
        break
      case CANCEL:
        closeSubscription(subscription)
        observer.cancel()
        break
      default:
        assert(
          false,
          `Unrecognized type ${type}. This is an error internal to Microcosm. ` +
            `Please file an issue: https://github.com/vigetlabs/microcosm/issues`
        )
    }
  } catch (e) {
    scheduler().raise(e)
  }

  if (subscription.closed) {
    cleanupSubscription(subscription)
  }
}

function onNotify(subscription: Subscription, type: string, value: *) {
  // On cancel, empty out the queue for subscriptions
  if (type === CANCEL) {
    subscription._queue.length = 0
  }

  switch (subscription._state) {
    case CLOSED:
      // If closed, do nothing
      break
    case BUFFERING:
      // Until the scheduler is ready to send out an update, push
      // notifications into a backlog
      subscription._queue.push({ type, value })
      break
    case WORKING:
      // Go ahead and send messages that result from subscription
      // callbacks while the subscription is processing
      notifySubscription(subscription, type, value)
      break
    case IDLE:
      // For any other phase, we are now buffering. Initiate a new
      // queue and push a job to flush it eventually.
      assert(
        subscription._queue.length <= 0,
        'This subscription has outstanding work, however it is trying ' +
          'to begin buffering. This is an error internal to Microcosm. ' +
          `Please file an issue: https://github.com/vigetlabs/microcosm/issues`
      )

      subscription._state = BUFFERING
      subscription._queue.push({ type, value })
      scheduler().push(flushSubscription.bind(undefined, subscription))
      break
    default:
      // There are two cases for which we can get into this state:
      //   1. A subscription is closed
      //   2. We've made a mistake and assigned an invalid state.
      // Both are exceptions. Throw in strict mode
      assert(
        false,
        `Observable subscription is in an invalid state.` +
          'This is an error internal to Microcosm. ' +
          `Please file an issue: https://github.com/vigetlabs/microcosm/issues`
      )
  }
}
