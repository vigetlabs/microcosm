/**
 * A factory that builds unique instances of a plugin given a
 * configuration object and options.
 *
 * Plugins are inherently stateful and full of side-effects,
 * so a new version of the plugin is created for each instance
 * of a Microcosm.
 */

module.exports = function PluginFactory(config, options, app) {
  return Object.assign({ app, options }, config)
}

module.exports.start = function start (plugin, callback) {
  if ('register' in plugin) {
    plugin.register(plugin.app, plugin.options, callback)
  } else {
    callback(null)
  }
}
