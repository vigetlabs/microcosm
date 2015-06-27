/**
 * Install
 * A simple FIFO queue for installing plugins
 */

function install (plugins, callback) {
  if (!plugins.length) {
    return callback(null)
  }

  let Plugin = plugins[0]
  let tail = plugins.slice(1)

  return new Plugin(function(err) {
    err ? callback(err) : install(tail, callback)
  })
}

module.exports = install
