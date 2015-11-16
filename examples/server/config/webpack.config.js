var path    = require('path')
var webpack = require('webpack')

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
    // Enables Hot Module Replacement
    new webpack.HotModuleReplacementPlugin(),
    // Handle errors more cleanly
    new webpack.NoErrorsPlugin()
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
