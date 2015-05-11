/**
 *  Remap
 *
 *  Reduces over a value, setting the current index/key
 *  to the result of a given function.
 *
 *  For example:
 *  remap({ foo: 'bar' }, word => word.toUpperCase()) = { foo: 'BAR' }
 */

module.exports = function remap (obj, transform, initial={}) {
  let keys = Object.keys(obj)

  return keys.reduce(function(memo, key) {
    memo[key] = transform(obj[key], key)
    return memo
  }, initial)
}
