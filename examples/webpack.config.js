var webpack = require('webpack')
var path    = require('path')

module.exports = {
  context: __dirname,
  devtool: 'inline-source-map',
  entry: {
    'chatbot'      : './chatbot/index',
    'react-router' : './react-router/index',
    'simple-svg'   : './simple-svg/index',
    'undo-tree'    : './undo-tree/index'
  },

  output: {
    filename: '[name]/main.js',
    path: path.join(__dirname, 'assets', 'js')
  },

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json' ],
    modulesDirectories: [ 'web_modules', 'node_modules' ]
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
  },

  devServer: {
    contentBase : __dirname,
    historyApiFallback: true
  }
}
