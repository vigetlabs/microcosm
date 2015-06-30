/**
 * Converts a promise into an error-first callback
 */

let isPromise = require('is-promise')

const DEFAULT_ERROR = new Error('Rejected Promise')

module.exports = function nodeify (promise, callback) {
  // Loose check until this lands:
  // https://github.com/then/is-promise/pull/3
  if (!isPromise(promise)) {
    return callback(null, promise)
  }

  return promise.then(function(body) {
    callback(null, body)
  }).catch(function(error) {
    callback(error || DEFAULT_ERROR)

    // Throw so future error handling can occur
    throw error
  })
}
