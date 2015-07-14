/**
 * Transaction
 * An account of what has happened. Follows the standard action specification here:
 * https://github.com/acdlite/flux-standard-action
 */

let signal  = require('./signal')
let flatten = require('./flatten')

function isComplete(transaction) {
  return transaction.error || transaction.meta.done
}

exports.create = function (type) {
  return {
    type,
    payload: null,
    meta: {
      active: false,
      done: false
    },
    error: null
  }
}

exports.run = function (transaction, body, progress, reject, callback, scope) {

  return signal(body, function (error, payload, pending) {
    transaction.payload = payload
    transaction.error = error

    transaction.meta.active = true
    transaction.meta.done = isComplete(transaction) || !pending

    if (error) {
      reject.call(scope, transaction)
    }

    progress.call(scope, transaction)

    if (callback && isComplete(transaction)) {
      // This is a neat trick to get around the promise try/catch
      // https://github.com/then/promise/blob/master/src/done.js
      setTimeout(callback.bind(scope, error, payload), 0)
    }
  })
}
