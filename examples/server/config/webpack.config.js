var webpack = require('webpack')
var path    = require('path')

module.exports = {
  context: path.resolve(__dirname, '../..'),

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
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    })
  ],

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json' ]
  },

  module: {
    loaders: [
      {
        test     : /\.jsx*$/,
        exclude  : /node_modules/,
        loader   : 'babel',
        query    : {
          optional : ['runtime']
        }
      }
    ]
  }
}
