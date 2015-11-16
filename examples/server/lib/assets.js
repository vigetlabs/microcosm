/**
 * Example Assets
 * This server plugin creates a proxy to a webpack dev server.
 */

import H2O2             from 'h2o2'
import Path             from 'path'
import URL              from 'url'
import Webpack          from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import config           from '../config/webpack.config'

export default function register (server, options, next) {
  var port = server.info.port + 1

  const location = URL.format({
    hostname: server.info.host,
    port: port,
    protocol: server.info.protocol
  })

  config.entry = Object.keys(config.entry).reduce(function (entries, next) {
    entries[next] = [
      'webpack-dev-server/client?' + location,
      'webpack/hot/only-dev-server',
      config.entry[next]
    ]

    return entries
  }, {})

  server.register(H2O2, function (error) {
    if (error) return next(error)

    server.route({
      method : 'GET',
      path   : '/assets/{path*}',
      handler: {
        proxy: {
          passThrough: true,
          mapUri(request, callback) {
            callback(null, URL.resolve(location, request.raw.req.url))
          }
        }
      }
    })

    config.output.publicPath = URL.resolve(location, 'assets')

    var compiler = Webpack(config)

    /**
     * A custom logger. When Webpack compiles, it will output
     * this reduced messaging
     */
    compiler.plugin("compile", function(params) {
      console.log("[info] Webpack is starting to compile...")
    })

    compiler.plugin("done", function (stats) {
      var rebuilt = stats.compilation.modules.filter(function(module) {
        return module.built
      })

      console.log(rebuilt)

      console.log('[info] Webpack built %s modules in %sms', rebuilt.length, stats.endTime - stats.startTime)
    })

    new WebpackDevServer(compiler, {
      contentBase : config.context,
      noInfo      : true,
      publicPath  : config.output.publicPath
    }).listen(port, next)
  })
}

register.attributes = {
  name : 'Assets'
}
