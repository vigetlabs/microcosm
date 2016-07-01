var StaticSite = require('static-site-generator-webpack-plugin')
var path = require('path')
var root = __dirname

module.exports = {

  context: root,

  devtool: 'inline-source-map',

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
    new StaticSite('chatbot-static', ['chatbot' ], {}),
    new StaticSite('react-router-static', ['react-router' ], {}),
    new StaticSite('simple-svg-static', ['simple-svg' ], {}),
    new StaticSite('painter-static', ['painter'], {})
  ],

  resolve: {
    extensions: [ '', '.js', '.jsx' ],
    alias: {
      'microcosm': path.resolve(__dirname, '../src'),
      'microcosm-debugger': path.resolve(__dirname, '../../microcosm-debugger/dist/microcosm-debugger')
    }
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
      }
    ]
  },

  devServer: {
    contentBase : path.resolve(root, '..', 'site'),
    publicPath  : '/',
    port        : process.env.PORT || 4000,
    noInfo      : true
  }
}
