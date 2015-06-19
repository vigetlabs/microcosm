/**
 * A factory that builds unique instances of a plugin given a
 * configuration object and options.
 *
 * Plugins are inherently stateful and full of side-effects,
 * so a new version of the plugin is created for each instance
 * of a Microcosm.
 */

module.exports = function PluginFactory(config, options, app) {

  let Plugin = function(callback) {
    this.app = app
    this.options = options

    this.register(this.app, this.options, callback)
  }

  Plugin.prototype = config

  if (process.env.NODE_ENV !== 'production' && typeof config.register !== 'function') {
    throw new TypeError("Plugins must include a register method.")
  }

  return Plugin
}
