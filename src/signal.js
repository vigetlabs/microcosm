/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values and promises
 */

let chain       = require('./chain')
let isGenerator = require('is-generator').fn
let nodeify     = require('./nodeify')

module.exports = function signal (action, params, callback) {
  let value     = action.apply(null, params)
  let processor = isGenerator(action) ? chain : nodeify

  return processor(value, callback)
}
