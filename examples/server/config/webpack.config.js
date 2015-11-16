var path    = require('path')
var webpack = require('webpack')
var url     = require('url')

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

    devtool: 'inline-source-map',

    entry: {
      'chatbot'      : './apps/chatbot/browser',
      'react-router' : './apps/react-router/browser',
      'simple-svg'   : './apps/simple-svg/browser',
      'undo-tree'    : './apps/undo-tree/browser'
    },

    output: {
      filename: '[name]/main.js',
      path: path.join(__dirname, 'assets', 'js')
    },

    plugins: [
      Logger,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ],

    resolve: {
      extensions: [ '', '.js', '.jsx' ]
    },

    module: {
      loaders: [{
        test     : /\.jsx*$/,
        exclude  : /node_modules/,
        loader   : 'babel',
        query    : {
          optional : ['runtime']
        }
      }]
    },

    devServer: {
      contentBase: root,
      port: port,
      noInfo: true,
      publicPath: url.resolve(location, 'assets')
    }
  }


  /**
   * Inject the dev server hot module replacement into
   * each entry point
   */
  config.entry = Object.keys(config.entry).reduce(function (entries, next) {
    entries[next] = [
      'webpack-dev-server/client?' + location,
      'webpack/hot/only-dev-server',
      config.entry[next]
    ]

    return entries
  }, {})


  return config
}
