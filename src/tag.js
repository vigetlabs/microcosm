/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

let uid = 0

module.exports = function(fn) {
  let name = fn.name || 'microcosm_action'
  let mark = uid++

  if (!fn.hasOwnProperty('toString')) {
    fn.toString = () => `${ name }_${ mark }`
  }

  return fn
}
