/*
 * remap
 * Copy an object, transforming each of its properties using
 * a given function
 */

module.exports = function (obj, transform) {
  let map = {}

  for (var key in obj) {
    map[key] = transform(obj[key], key, obj)
  }

  return map
}
