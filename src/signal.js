/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values, and promises
 */

let isPromise  = require('is-promise')
let isIterator = require('is-iterator-like')

module.exports = function signal (resolve, reject, body) {
  let pipe = signal.bind(null, resolve, reject)

  if (isPromise(body)) {
    return body.then(pipe, function(error) {
      reject(error)

      // Throw so future error handling can occur
      throw error
    })
  }

  /**
   * Is it an iterator?
   *
   * Generators produce "child signals" that process sequentially.
   * When a child signal finishes processing, it acts as the state
   * for the signal until the next iteration is processed.
   *
   * TODO: This is too branchy. How can we make this less complex?
   */
  if (isIterator(body)) {
    // 1. Get the first iteration
    let { value, done } = body.next()

    return (function step(params) {
      let { value, done } = body.next()

      // 2. Send a signal for this iteration
      let progress = function (result) {
        resolve(result, done)

        // 3. If done, return the result, otherwise step
        // into the next iteration
        return done ? result : step(value)
      }

      return signal(progress, reject, params)

    }(value))
  }

  return resolve(body, true)
}
