/**
 * A factory that builds unique instances of a plugin given a
 * configuration object and options.
 *
 * Plugins are inherently stateful and full of side-effects,
 * so a new version of the plugin is created for each instance
 * of a Microcosm.
 */

function throwIfError (error) {
  if (error) {
    throw error
  }
}

function ensureCallback (plugin) {
  // Plugins that follow register(app, options, next) are asynchronous
  if (plugin.register.length >= 3) {
    return plugin.register
  }

  // Otherwise wrap synchronous plugins to match the async flow
  return function (app, options, next) {
    plugin.register(app, options)

    next(null)
  }
}

function installPlugin (next, plugin) {
  if (!plugin.register) return next

  return function (error) {
    if (error != null) {
      return next(error)
    }

    return ensureCallback(plugin).call(plugin, plugin.app, plugin.options, next)
  }
}

export default function (plugins, callback=throwIfError) {
  return plugins.reduceRight(installPlugin, callback)()
}
