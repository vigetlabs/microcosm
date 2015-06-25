/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values and promises
 */

let isPromise   = require('is-promise')
let isGenerator = require('is-generator').fn

function evaluate (body, resolve, reject) {
  if (isPromise(body)) {
    return body.then(resolve, function(error) {
      reject(error)

      // Throw so future error handling can occur
      throw error
    })
  }

  return resolve(body, true)
}

function chain(iterator, resolve, reject) {
  let { value } = iterator.next()

  return (function step (params) {
    let { value, done } = iterator.next()

    return evaluate(params, function(result) {

      resolve(result, done)

      return done ? result : step(value)
    }, reject)

  }(value))
}

module.exports = function signal (action, params, resolve, reject, scope) {
  let value     = action.apply(scope, params)
  let processor = isGenerator(action) ? chain : evaluate

  return processor(value, resolve.bind(scope), reject.bind(scope))
}
