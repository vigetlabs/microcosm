/**
 * A factory that builds unique instances of a plugin given a
 * configuration object and options.
 *
 * Plugins are inherently stateful and full of side-effects,
 * so a new version of the plugin is created for each instance
 * of a Microcosm.
 */

const defaults = {
  __start(callback) {
    this.register(this.app, this.options, callback)
  },

  register(app, options, next) {
    next(null)
  }
}

module.exports = function PluginFactory(config, options, app) {
  return Object.assign({ app, options }, defaults, config)
}
