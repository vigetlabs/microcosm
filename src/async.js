/**
 * Chain generator calls using nodeify
 */

let isGenerator = require('is-generator')
let isPromise = require('is-promise')

const DEFAULT_ERROR = new Error('Rejected Promise')

function onSuccess(callback, body) {
  return callback(null, body, true)
}

function onFailure(callback, error) {
  callback(error || DEFAULT_ERROR, null, true)

  // Throw so future error handling can occur
  throw error
}

function nodeify (promise, callback) {
  if (!isPromise(promise)) {
    return callback(null, promise, true)
  }

  return promise.then(onSuccess.bind(null, callback),
                      onFailure.bind(null, callback))
}

function waterfall (iterator, callback) {
  return nodeify(iterator.next().value, function step (error, body) {
    let { done, value } = iterator.next()

    callback(error, body, done)

    return error || done ? body : nodeify(value, step)
  })
}

function chain (value, callback) {
  return (isGenerator(value) ? waterfall : nodeify)(value, callback)
}

module.exports = chain
