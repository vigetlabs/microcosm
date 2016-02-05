/**
 * Take a value, be it primitive, a promise, or a generator, and reduce it down
 * into chunks processable by transactions.
 */

import { isGenerator, isPromise } from './type-checks'
import unpromise from './unpromise'

/**
 * If a given value is a promise, wait for it and
 * execute a callback using the error-first convention.
 *
 * @param {any} value - The target value
 * @param {Function} callback - An error-first callback
 */
let nodeify = function (value, callback) {
  if (!isPromise(value)) {
    return callback(null, value, true)
  }

  unpromise(value, function (error, body) {
    callback(error, body, true)
  })

  return value
}

/**
 * Given an iterator, call nodeify sequentially on each iteration.
 *
 * @param {Iterator} iterator - An iterable collection
 * @param {Function} callback - An error-first callback
 */

let waterfall = function (iterator, callback) {
  let start = iterator.next()

  return coroutine(start.value, function step (error, body, complete) {
    // If next.value is a generator, it's possible that it is not complete.
    // When this is the case, do not progress the parent iterator forward
    // until the child completes successfully.
    if (error || !complete) {
      return callback(error, body, complete)
    }

    let next = iterator.next(body)

    callback(error, body, next.done)

    return next.done ? body : coroutine(next.value, step)
  })
}

/**
 * Checks if a given value is a generator. If so, process it sequentially.
 * Otherwise resolve the specific value using `nodeify`.
 *
 * @param {any} value - The compared value
 * @param {Function} callback - An error-first callback
 */
let coroutine = function (value, callback) {
  return (isGenerator(value) ? waterfall : nodeify)(value, callback)
}

export default coroutine
