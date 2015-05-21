/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

const uid = require('uid')

module.exports = function(fn) {
  if (!fn.hasOwnProperty('toString')) {
    var mark = uid()
    fn.toString = () => 'microcosm_tagged_' + mark
  }
}
