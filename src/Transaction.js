/**
 * Transaction
 * An account of what has happened.
 */

export default function Transaction (type, payload, complete) {
  return {
    type     : `${ type }`,
    error    : false,
    active   : arguments.length > 1,
    payload  : payload,
    complete : complete
  }
}
