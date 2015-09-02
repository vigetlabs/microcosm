/**
 * A factory that builds unique instances of a plugin given a
 * configuration object and options.
 *
 * Plugins are inherently stateful and full of side-effects,
 * so a new version of the plugin is created for each instance
 * of a Microcosm.
 */

function checkPlugin (plugin) {
  if (process.env.NODE_ENV !== 'production' && typeof plugin !== 'function' && ('register' in plugin && typeof plugin.register !== 'function')) {
    throw TypeError('Expected plugin to be a function or entity with a method property.')
  }
}

function installPlugin (next, { app, options, plugin }) {
  checkPlugin(plugin)

  return function (error) {
    // Halt execution of all future plugin installation if there is an error
    if (error) {
      return next(error)
    }

    if (typeof plugin == 'function') {
      return plugin(app, options, next)
    } else {
      // Clone plugins to privatize state
      plugin = Object.create(plugin)
    }

    // Plugins might not have a register method. In this case, just continue through
    return plugin.register ? plugin.register(app, options, next) : next(null)
  }
}

exports.install = function (plugins, callback) {
  return plugins.reduceRight(installPlugin, callback)(null)
}
