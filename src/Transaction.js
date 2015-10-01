/**
 * Transaction
 * An account of what has happened.
 */

let assert = require('assert')

module.exports = function Transaction (type, payload, complete) {
  assert.ok(type, 'Transaction was created with the invalid type: ' + type)

  return {
    type     : `${ type }`,
    error    : false,
    active   : arguments.length > 1,
    payload  : payload,
    complete : complete
  }
}
