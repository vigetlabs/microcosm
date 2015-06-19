/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values, and promises
 */

let REJECTED_PROMISE = new Error({ message: 'Promise rejected' })

module.exports = function signal (next, body) {
  let pipe = signal.bind(null, next)

  // Is it a promise?
  if (body && typeof body.then === 'function') {
    // Important! Do not return this chain so that
    // error handing can be conducted in the client
    body.then(pipe, function(err) {
      // This is so that an error is always defined
      next(err || REJECTED_PROMISE)
    })

    return body
  }

  /**
   * Is it a generator?
   * Generators produce "child signals" that process sequentially.
   * When a child signal finishes processing, it acts as the state
   * for the signal until the next iteration is processed.
   *
   * TODO: This is too branchy. How can we make this less complex?
   */
  if (body && typeof body.next === 'function') {
    // 1. Get the first iteration
    let { value, done } = body.next()

    return (function step(params) {
      let { value, done } = body.next()

      // 2. Send a signal for this iteration
      return signal(function(error, result) {
        // If it fails, halt the signal and return an error
        if (error) {
          return next(error, result, true)
        }

        // Otherwise pass the new signal state along
        next(error, result, done)

        // If no more iterations exist, stop. Otherwise repeat.
        return done ? result : step(value)
      }, params)

    }(value))
  }

  return next(null, body, true)
}
