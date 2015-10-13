/**
 * Transaction
 * An account of what has happened.
 */

export default function Transaction (type, payload, complete) {
  if (process.env.NODE_ENV !== 'production' && !type) {
    throw new TypeError('Transaction was created with the invalid type: ' + type)
  }

  return {
    type     : `${ type }`,
    error    : false,
    active   : arguments.length > 1,
    payload  : payload,
    complete : complete
  }
}
