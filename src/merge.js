const hasOwn = Object.prototype.hasOwnProperty

/**
 * Merge any number of objects into a provided object
 *
 * @private
 * @params {...Object} values - Any number of objects to fold properties into the first
 * @return {Object} The first provided value, extended with all others
 */
export default function merge (subject) {
  for (var i = 1, len = arguments.length; i < len; i++) {
    var next = arguments[i]

    for (var key in next) {
      if (hasOwn.call(next, key)) {
        subject[key] = next[key]
      }
    }
  }

  return subject
}
