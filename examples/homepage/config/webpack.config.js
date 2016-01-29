var path    = require('path')
var webpack = require('webpack')
var url     = require('url')
var isDev   = process.env.NODE_ENV !== 'production'

module.exports = function (server) {
  var port = server.info.port + 1

  var location = url.format({
    hostname : server.info.host,
    port     : port,
    protocol : server.info.protocol
  })

  var root = path.resolve(__dirname, '../..')

  /**
   * A custom logger. When Webpack compiles, it will output
   * this reduced messaging
   */
  var Logger = {
    apply: function (compiler) {
      compiler.plugin("compile", function(params) {
        server.log(["webpack"], "Starting to compile...")
      })

      compiler.plugin("done", function (stats) {
        var rebuilt = stats.compilation.modules.filter(module => module.built)
        server.log(["webpack"], "built " + rebuilt.length + " modules in " + (stats.endTime - stats.startTime))
      })
    }
  }

  var config = {
    context: root,

    devtool: isDev ? 'inline-source-map' : 'source-map',

    entry: {
      'chatbot'      : './chatbot/client',
      'react-router' : './react-router/client',
      'simple-svg'   : './simple-svg/client',
      'undo-tree'    : './undo-tree/client'
    },

    output: {
      filename: '[name]/main.js',
      path: root
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
      publicPath: location + '/'
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
