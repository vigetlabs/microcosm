/**
 * Transaction
 * An account of what has happened. Follows the standard action specification here:
 * https://github.com/acdlite/flux-standard-action
 */

let signal = require('./signal')

exports.create = function (type) {
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

exports.run = function (transaction, body, update, reject, callback, scope) {
  return signal(body, function (error, payload, done) {
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
