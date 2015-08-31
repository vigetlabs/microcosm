/**
 * A simple FIFO queue for installing plugins
 */

let { start } = require('./plugin')

module.exports = function install (plugins, callback) {

  return plugins.reduceRight(function(done, plugin) {

    return error => error ? callback(error) : start(plugin, done)
  }, callback)(null)
}
