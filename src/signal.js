/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values, and promises
 */

let isGenerator = require('./isGenerator')
let isPromise   = require('./isPromise')

module.exports = function signal (resolve, reject, body) {
  let pipe = signal.bind(null, resolve, reject)

  if (isPromise(body)) {
    // Return a promise without catching a rejection
    body.then(pipe, reject)
    return body
  }

  if (isGenerator(body)) {
    for (var value of body) {
      pipe(value)
    }
    return value
  }

  return resolve(body)
}
