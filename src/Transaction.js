/**
 * Transaction
 * An account of what has happened. Follows the standard action specification here:
 * https://github.com/acdlite/flux-standard-action
 */

let coroutine = require('./coroutine')
let eventually = require('./eventually')

function create (type, payload=null) {
  return {
    type: `${ type }`,
    payload,
    meta: {
      active: false,
      done: false
    },
    error: false
  }
}

function run (transaction, body, update, reject, callback, scope) {
  return coroutine(body, function updateTransaction (error, payload, done) {
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
      eventually(callback, scope, error, payload);
    }
  })
}

module.exports = { run, create }
