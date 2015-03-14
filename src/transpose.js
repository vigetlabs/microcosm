/**
 * Transpose
 * Reduces over a value, setting the current index/key
 * to the result of a given function.
 *
 * For example:
 * transpose({ foo: 'bar' }, word => word.toUpperCase()) = { foo: 'BAR' }
 *
 */

export default (entity={}, fn, initial={}) => {
  let keys = Object.keys(entity)

  return keys.reduce((memo, key) => {
    memo[key] = fn(entity[key], key)
    return memo
  }, initial)
}
