var path = require('path')
var webpack = require('webpack')
var StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin')

var isDev = process.env.NODE_ENV !== 'production'
var root  = __dirname

module.exports = {

  context: root,

  devtool: isDev ? 'inline-source-map' : 'source-map',

  entry: {
    'chatbot'      : './chatbot/client',
    'react-router' : './react-router/client',
    'simple-svg'   : './simple-svg/client',
    'painter'      : './painter/client',

    'chatbot-static'      : './chatbot/static',
    'react-router-static' : './react-router/static',
    'simple-svg-static'   : './simple-svg/static',
    'painter-static'      : './painter/static'
  },

  output: {
    filename: '[name]/main.js',
    path: path.resolve(root, '..', 'site'),
    libraryTarget: 'umd'
  },

  plugins: [
    new StaticSiteGeneratorPlugin('chatbot-static', ['chatbot' ], {}),
    new StaticSiteGeneratorPlugin('react-router-static', ['react-router' ], {}),

    new StaticSiteGeneratorPlugin('simple-svg-static', ['simple-svg' ], {}),
    new StaticSiteGeneratorPlugin('painter-static', ['painter' ], {}),

    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ],

  resolve: {
    extensions: [ '', '.js', '.jsx' ]
  },

  module: {
    loaders: [
      {
        test: /\.html/,
        loader: 'mustache',
        exclude: /node_modules/
      },
      {
        test     : /\.jsx*$/,
        loader   : 'babel',
        exclude: /node_modules/
      }]
  },

  devServer: {
    contentBase : path.resolve(root, '..', 'site'),
    publicPath  : '/',
    port        : process.env.PORT || 4000,
    noInfo      : true
  }
}

// Inject the dev server hot module replacement into
// each entry point on development
if (!isDev) {
  // Otherwise enable production settings
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  )
}
