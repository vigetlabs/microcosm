var webpack = require('webpack')
var path    = require('path')

module.exports = {
  context: __dirname,
  devtool: 'inline-source-map',
  entry: {
    'react-router' : './react-router/index',
    'simple-svg' : './simple-svg/index',
    'chatbot' : './chatbot/index'
  },

  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'assets', 'js')
  },

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src' ]
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
