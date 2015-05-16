/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

let uid = 0

module.exports = function(fn) {
  if (!fn.hasOwnProperty('toString')) {
    let mark = uid += 1
    fn.toString = () => 'microcosm_tagged_' + mark
  }
}
