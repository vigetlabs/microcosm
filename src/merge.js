const hasOwn = Object.prototype.hasOwnProperty

function foldInTo (a, b) {
  if (b == null || a === b) {
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
 * @params {...Object} values - Any number of objects to fold properties into the first
 * @return {Object} The first provided value, extended with all others
 */
export default function merge (/** values */) {
  let reduction = arguments[0]

  if (reduction == null) {
    return reduction
  }

  for (var i = 1, len = arguments.length; i < len; i++) {
    reduction = foldInTo(reduction, arguments[i])
  }

  return reduction
}
