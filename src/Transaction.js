/**
 * Transaction
 * An account of what has happened.
 */

module.exports = function Transaction (type, payload=null) {
  return {
    type     : `${ type }`,
    payload  : payload,
    active   : false,
    error    : false,
    complete : false
  }
}
