/**
 * Example Assets
 * This server plugin creates a proxy to a webpack dev server.
 */

import H2O2             from 'h2o2'
import Webpack          from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import Path             from 'path'
import URL              from 'url'
import config           from '../config/webpack.config'

export default function register (server, options, next) {
  const port = server.info.port + 1

  const location = URL.format({
    hostname: server.info.host,
    port: port,
    protocol: server.info.protocol
  })

  server.register(H2O2, function (error) {
    if (error) return next(error)

    server.route({
      method : 'GET',
      path   : '/assets/{path*}',
      handler: {
        proxy: {
          passThrough: true,
          mapUri(request, callback) {
            callback(null, URL.resolve(location, request.raw.req.url.replace('/assets', '/apps')))
          }
        }
      }
    })

    new WebpackDevServer(Webpack(config), {
      noInfo: true,
      publicPath: '/apps/',
      contentBase: config.context
    }).listen(port, next)
  })
}

register.attributes = {
  name: 'Assets'
}
