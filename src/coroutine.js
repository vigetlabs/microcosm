/**
 * Take a value, be it primitive, a promise, or a generator, and reduce it down
 * into chunks processable by transactions.
 */

let isGenerator = require('./is-generator')
let isPromise = require('is-promise')

const DEFAULT_ERROR = new Error('Rejected Promise')

/**
 * If a given value is a promise, wait for it and
 * execute a callback using the error-first convention.
 *
 * @param {any} promise - The target value
 * @param {Function} callback - An error-first callback
 */
let nodeify = function (promise, callback) {
  if (!isPromise(promise)) {
    return callback(null, promise, true)
  }

  return promise.then(body => callback(null, body, true), function(error) {
    callback(error || DEFAULT_ERROR, null, true)
    throw error
  })
}

/**
 * Given an iterator, call nodeify sequentially on each iteration
 *
 * @param {Iterator} iterator - An iterable collection
 * @param {Function} callback - An error-first callback
 */
let waterfall = function (iterator, callback) {
  return coroutine(iterator.next().value, function step (error, body) {
    let { done, value } = iterator.next()

    callback(error, body, done)

    return done ? body : coroutine(value, step)
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

module.exports = coroutine
