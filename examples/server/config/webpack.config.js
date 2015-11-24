var path    = require('path')
var webpack = require('webpack')
var url     = require('url')
var isDev   = process.env.NODE_ENV !== 'production'

/**
 * A custom logger. When Webpack compiles, it will output
 * this reduced messaging
 */
var Logger = {
  apply: function (compiler) {
    compiler.plugin("compile", function(params) {
      console.log("[info] Webpack is starting to compile...")
    })

    compiler.plugin("done", function (stats) {
      var rebuilt = stats.compilation.modules.filter(module => module.built)

      console.log('[info] Webpack built %s modules in %sms', rebuilt.length, stats.endTime - stats.startTime)
    })
  }
}

module.exports = function (server) {
  var port = server.info.port + 1

  var location = url.format({
    hostname : server.info.host,
    port     : port,
    protocol : server.info.protocol
  })

  var root = path.resolve(__dirname, '../..')

  var config = {
    context: root,

    devtool: isDev ? 'inline-source-map' : 'source-map',

    entry: {
      'chatbot'      : './chatbot/browser',
      'react-router' : './react-router/browser',
      'simple-svg'   : './simple-svg/browser',
      'undo-tree'    : './undo-tree/browser'
    },

    output: {
      filename: '[name]/main.js',
      path: path.join(__dirname, 'assets', 'js')
    },

    plugins: [
      Logger,
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      })
    ],

    resolve: {
      extensions: [ '', '.js', '.jsx' ]
    },

    module: {
      loaders: [{
        test     : /\.jsx*$/,
        loader   : 'babel',
        query    : {
          optional : [ 'runtime' ]
        },
        exclude: /node_modules/
      }]
    },

    node: {
      Buffer  : false,
      process : false
    },

    devServer: {
      contentBase: root,
      port: port,
      noInfo: true,
      publicPath: url.resolve(location, 'assets')
    }
  }


  // Inject the dev server hot module replacement into
  // each entry point on development
  if (!isDev) {
    // Otherwise enable production settings
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.OccurenceOrderPlugin()
    )
  }


  return config
}
