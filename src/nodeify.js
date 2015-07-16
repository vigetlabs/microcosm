/**
 * Converts a promise into an error-first callback
 */

let isPromise = require('is-promise')

const DEFAULT_ERROR = new Error('Rejected Promise')

module.exports = function nodeify (promise, callback) {
  if (!isPromise(promise)) {
    return callback(null, promise, true)
  }

  return promise.then(function(body) {
    callback(null, body, true)
  }).catch(function(error) {
    callback(error || DEFAULT_ERROR, null, true)

    // Throw so future error handling can occur
    throw error
  })
}
