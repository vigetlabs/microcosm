/*
 * remap
 * Copy an object, transforming each of its properties using
 * a given function
 */

module.exports = function remap (obj, transform) {
  const keys = Object.keys(obj)

  return keys.reduce(function(memo, key) {
    memo[key] = transform(obj[key], key, obj)
    return memo
  }, {})
}
