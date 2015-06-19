/**
 * Install
 * A simple FIFO queue for installing plugins
 */

let install = function (plugins, done) {
  if (!plugins.length) {
    return done(null)
  }

  let Plugin = plugins[0]
  let tail   = plugins.slice(1)

  return new Plugin(function(err) {
    err ? done(err) : install(tail, done)
  })
}

module.exports = install
