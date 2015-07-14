/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values and promises
 */

let chain       = require('./chain')
let isGenerator = require('is-generator')
let nodeify     = require('./nodeify')

module.exports = function signal (value, callback) {
  let processor = isGenerator(value) ? chain : nodeify

  return processor(value, callback)
}
