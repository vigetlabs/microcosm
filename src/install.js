/**
 * A factory that builds unique instances of a plugin given a
 * configuration object and options.
 *
 * Plugins are inherently stateful and full of side-effects,
 * so a new version of the plugin is created for each instance
 * of a Microcosm.
 */

function checkPlugin (plugin) {
  if (process.env.NODE_ENV === 'development' && ('register' in plugin) && typeof plugin.register !== 'function') {
    throw TypeError('Expected register property of plugin to be a function, instead got ' + plugin.register)
  }
}

function installPlugin (next, plugin) {
  checkPlugin(plugin)

  return function (error) {
    // Halt execution of all future plugin installation if there is an error
    if (error) {
      return next(error)
    }

    // Plugins might not have a register method. In this case, just continue through
    return plugin.register ? plugin.register(plugin.app, plugin.options, next) : next(null)
  }
}

module.exports = function installPlugins (plugins, callback) {
  return plugins.reduceRight(installPlugin, callback)(null)
}
