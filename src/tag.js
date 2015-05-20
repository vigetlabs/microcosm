/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

var uid = 0

module.exports = function(fn) {
  if (!fn.hasOwnProperty('toString')) {
    var mark = uid += 1
    fn.toString = () => 'microcosm_tagged_' + mark
  }
}
