/**
 * Example Assets
 * This server plugin creates a proxy to a webpack dev server.
 */

import Webpack          from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import config           from '../config/webpack.config'

export default function register (server, _, next) {
  let compiler = Webpack(config(server))
  let options  = compiler.options

  server.route({
    method : 'GET',
    path   : '/assets/{path*}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri(request, callback) {
          callback(null, options.devServer.publicPath + '/' + request.params.path)
        }
      }
    }
  })

  return new WebpackDevServer(compiler, options.devServer).listen(options.devServer.port, next)
}

register.attributes = {
  name: 'Assets',
  dependencies: 'h2o2'
}
