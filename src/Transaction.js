/**
 * Transaction
 * An account of what has happened. Follows the standard action specification here:
 * https://github.com/acdlite/flux-standard-action
 */

let async = require('./async')

function create (type) {
  return {
    type,
    payload: null,
    meta: {
      active: false,
      done: false
    },
    error: false
  }
}

function run (transaction, body, update, reject, callback, scope) {
  return async(body, function updateTransaction (error, payload, done) {
    transaction.meta.active = true
    transaction.meta.done = done

    if (error) {
      transaction.error = true
      transaction.payload = error
      reject.call(scope, transaction)
    } else {
      transaction.payload = payload
      update.call(scope, transaction)
    }

    if (done && callback) {
      // This is a neat trick to get around the promise try/catch
      // https://github.com/then/promise/blob/master/src/done.js
      setTimeout(callback.bind(scope, error, payload), 0)
    }
  })
}

module.exports = { run, create }
