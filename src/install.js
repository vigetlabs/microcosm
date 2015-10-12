/**
 * A factory that builds unique instances of a plugin given a
 * configuration object and options.
 *
 * Plugins are inherently stateful and full of side-effects,
 * so a new version of the plugin is created for each instance
 * of a Microcosm.
 */

const NOOP = () => {}

function installPlugin (next, plugin) {
  return function (error) {
    return error != null ? next(error) : plugin.register(plugin.app, plugin.options, next)
  }
}

export default function (plugins, callback=NOOP) {
  return plugins.reduceRight(installPlugin, callback)()
}
