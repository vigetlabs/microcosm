/**
 * Transaction
 * An account of what has happened. Follows the standard action specification here:
 * https://github.com/acdlite/flux-standard-action
 */

let id = 0
let pool = []

const blueprint = {
  id       : null,
  payload  : null,
  type     : null,
  error    : false,
  complete : false
}

module.exports = function Transaction (type, payload=null) {
  let transaction = pool.pop() || Object.create(blueprint)

  transaction.id       = id++
  transaction.payload  = payload
  transaction.type     = type
  transaction.error    = false
  transaction.complete = false

  return transaction
}

module.exports.release = function(transaction) {
  pool.push(transaction)
}
