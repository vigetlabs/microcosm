/**
 * Taken from zen-observable, with specific implimentation notes for Microcosm
 */

import { getSymbol, result } from './utils'

class Subscription {
  constructor(observer, subscriber) {
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

  get next() {
    return handleNext.bind(null, this._subscription)
  }

  get complete() {
    return handleComplete.bind(null, this._subscription)
  }

  get error() {
    return handleError.bind(null, this._subscription)
  }
}

export class Observable {
  constructor(subscriber) {
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

  map(fn) {
    return new Observable(observer =>
      this.subscribe({
        next(value) {
          if (observer.closed) return

          try {
            value = fn(value)
          } catch (e) {
            return observer.error(e)
          }

          return observer.next(value)
        },

        error: observer.error,
        complete: observer.complete
      })
    )
  }

  filter(fn) {
    return new Observable(observer =>
      this.subscribe({
        next(value) {
          if (observer.closed) {
            return
          }

          try {
            if (!fn(value)) {
              return undefined
            }
          } catch (e) {
            return observer.error(e)
          }

          return observer.next(value)
        },

        error: observer.error,
        complete: observer.error
      })
    )
  }

  reduce(fn) {
    let hasSeed = arguments.length > 1
    let hasValue = false
    let seed = arguments[1]
    let acc = seed

    return new Observable(observer =>
      this.subscribe({
        next(value) {
          if (observer.closed) {
            return
          }

          let first = !hasValue
          hasValue = true

          if (!first || hasSeed) {
            try {
              acc = fn(acc, value)
            } catch (e) {
              return observer.error(e)
            }
          } else {
            acc = value
          }
        },

        error: observer.error,

        complete() {
          if (!hasValue && !hasSeed) {
            observer.error(new TypeError('Cannot reduce an empty sequence'))
            return
          }

          observer.next(acc)
          observer.complete()
        }
      })
    )
  }

  flatMap(fn) {
    return new Observable(observer => {
      let completed = false
      let subscriptions = []

      // Subscribe to the outer Observable
      let outer = this.subscribe({
        next(value) {
          if (fn) {
            try {
              value = fn(value)
            } catch (x) {
              observer.error(x)
              return
            }
          }

          // Subscribe to the inner Observable
          Observable.from(value).subscribe({
            _subscription: null,

            start(s) {
              subscriptions.push((this._subscription = s))
            },
            next(value) {
              observer.next(value)
            },
            error(e) {
              observer.error(e)
            },

            complete() {
              let i = subscriptions.indexOf(this._subscription)

              if (i >= 0) {
                subscriptions.splice(i, 1)
              }

              closeIfDone()
            }
          })
        },

        error: observer.error,

        complete() {
          completed = true
          closeIfDone()
        }
      })

      function closeIfDone() {
        if (completed && subscriptions.length === 0) {
          observer.complete()
        }
      }

      return () => {
        subscriptions.forEach(s => s.unsubscribe())
        outer.unsubscribe()
      }
    })
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

        if (observer.closed) {
          return
        }
      }

      observer.complete(last)
    })
  }

  static from(source) {
    if (Array.isArray(source)) {
      return Observable.of(...source)
    }

    if (source && getSymbol('observable') in source) {
      return fromObservable(source)
    }

    if (source && getSymbol('iterator') in source) {
      return fromIterator(source)
    }

    throw new TypeError(source + ' is not observable')
  }
}

function cleanupSubscription(subscription) {
  // Assert:  observer._observer is undefined
  let cleanup = subscription._cleanup

  if (cleanup) {
    // Drop the reference to the cleanup function so that we won't call it
    // more than once
    subscription._cleanup = undefined

    // Call the cleanup function
    cleanup()
  }
}

function handleNext(subscription, value) {
  if (subscription._observer && subscription._observer.next) {
    return subscription._observer.next(value)
  }
}

function handleError(subscription, value) {
  let observer = subscription._observer
  let error = null

  // If the stream is closed, throw the error to the caller
  if (observer === undefined) {
    throw value
  }

  subscription._observer = undefined

  try {
    if (!observer.error) {
      throw value
    }
    observer.error(value)
  } catch (e) {
    error = e
  }

  cleanupSubscription(subscription)

  if (error) {
    throw error
  }
}

function handleComplete(subscription, value) {
  let observer = subscription._observer
  let error = null

  // If the stream is closed, then return undefined
  if (observer === undefined) {
    return undefined
  }

  subscription._observer = undefined

  if (observer.complete) {
    try {
      observer.complete(value)
    } catch (e) {
      error = e
    }
  }

  cleanupSubscription(subscription)

  if (error) {
    throw error
  }
}

export function fromObservable(object) {
  let observable = result(object, getSymbol('observable'))

  if (Object(observable) !== observable) {
    throw new TypeError(observable + ' is not an object')
  }

  if (observable.constructor === Observable) {
    return observable
  }

  return new Observable(observer => observable.subscribe(observer))
}

export function fromIterator(object) {
  return new Observable(observer => {
    let iterator = result(object, getSymbol('iterator'))
    let next = iterator.next()
    let last = undefined

    while (next.done === false) {
      last = next.value
      observer.next(last)

      if (observer.closed) {
        break
      }

      next = iterator.next(last)
    }

    observer.complete(last)
  })
}
