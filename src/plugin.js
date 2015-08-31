/**
 * A factory that builds unique instances of a plugin given a
 * configuration object and options.
 *
 * Plugins are inherently stateful and full of side-effects,
 * so a new version of the plugin is created for each instance
 * of a Microcosm.
 */

function PluginFactory(config, options, app) {
  return Object.assign({ app, options }, config)
}

function installPlugin (next, plugin) {
  return function (error) {
    // Halt execution of all future plugin installation if there is an error
    if (error) {
      return next(error)
    }

    // Plugins might not have a register method. In this case, just continue through
    return plugin.register ? plugin.register(plugin.app, plugin.options, next) : next(null)
  }
}

function install (plugins, callback) {
  return plugins.reduceRight(installPlugin, callback)(null)
}

module.exports = PluginFactory
module.exports.install = install
