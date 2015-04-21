/*
 * remap
 * Take an object and assign new values onto another object
 * given a transformation function
 */

module.exports = function remap (obj, transform, initial={}) {
  let keys = Object.keys(obj)

  return keys.reduce(function(memo, key) {
    memo[key] = transform(obj[key], key)
    return memo
  }, initial)
}
