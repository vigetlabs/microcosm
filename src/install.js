/**
 * Install
 * A simple FIFO queue for installing plugins
 */

export default function install ([plugin, ...tail], app, callback) {
  if (!plugin) return callback()

  plugin.register(app, app._options, function(err) {
    if (err) throw err
    install(tail, app, callback)
  })
}
