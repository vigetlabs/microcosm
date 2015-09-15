/**
 * Transaction
 * An account of what has happened. Follows the standard action specification here:
 * https://github.com/acdlite/flux-standard-action
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
