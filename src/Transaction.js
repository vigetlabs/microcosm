/**
 * Transaction
 * An account of what has happened. Follows the standard action specification here:
 * https://github.com/acdlite/flux-standard-action
 */

const POOL = []
const BLUEPRINT = {
  id       : null,
  payload  : null,
  type     : null,
  error    : false,
  complete : false
}

let id = 0

module.exports = function Transaction (type, payload=null) {
  let transaction = POOL.pop() || Object.create(BLUEPRINT)

  transaction.id       = id++
  transaction.payload  = payload
  transaction.type     = type
  transaction.error    = false
  transaction.complete = false

  return transaction
}

module.exports.release = function(transaction) {
  POOL.push(transaction)
}
