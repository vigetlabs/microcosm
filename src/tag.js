/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

let uid = 0

module.exports = function tag (fn) {
  if (process.env.NODE_ENV !== 'production' && (typeof fn !== 'function')) {
    throw TypeError('Attempted to tag an action, but the provided value is not a function. Instead got ' + typeof fn)
  }

  let name = fn.name || 'microcosm_action'
  let mark = uid++

  if (!fn.hasOwnProperty('toString')) {
    fn.toString = () => `${ name }_${ mark }`
  }

  return fn
}
