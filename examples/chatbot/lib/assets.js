/**
 * Server asset management
 */

var webpack    = require('webpack')
var webpackDev = require('webpack-dev-middleware')
var config     = require('../../webpack.config')('development')

module.exports = function () {
  var compiler = webpack(config)

  return webpackDev(compiler)
}
