/**
 * Copy an object, transforming each of its properties using
 * a given function
 *
 * @param {Object} obj - The target to map over
 * @param {Function} transform - The function to apply over all keys of the target
 * @return Object
 */

module.exports = function (obj, transform, scope) {
  let map = {}

  for (var key in obj) {
    map[key] = transform.call(scope, obj[key], key, obj)
  }

  return map
}
