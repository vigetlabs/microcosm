let uid = 0

function Plugin(config, options) {
  Object.assign(this, config)

  this.name    = this.name || 'microcosm_plugin_' + uid++
  this.options = options
}

Plugin.prototype = {
  start(app, next) {
    return this.register(app, this.options, next)
  },

  register(app, options, next) {
    next()
  },

  toString() {
    return this.name
  }
}

module.exports = Plugin
