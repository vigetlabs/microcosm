/**
 * Install
 * A simple FIFO queue for installing plugins
 */

let install = function ([plugin, ...tail], app, callback) {
  if (!plugin) return callback()

  plugin.register(app, plugin.options, function(err) {
    if (err) throw err
    install(tail, app, callback)
  })
}

module.exports = install
