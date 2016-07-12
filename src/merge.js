const hasOwn = Object.prototype.hasOwnProperty

function foldInTo (a, b) {
  if (a == null || b == null) {
    return a
  }

  for (let key in b) {
    if (hasOwn.call(b, key)) {
      a[key] = b[key]
    }
  }

  return a
}

/**
 * Merge any number of objects into a provided object
 *
 * @private
 * @params {...Object} Any number of objects to fold properties into the first
 * @return {Object} The first provided value, extended with all others
 */
export default function merge (...values) {

  return values.reduce(foldInTo)
}
