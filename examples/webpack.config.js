var webpack = require('webpack')
var path    = require('path')

module.exports = {
  context: __dirname,
  devtool: 'inline-source-map',
  entry: {
    'advanced' : './advanced/src/index',
    'simple-svg' : './simple-svg/index',
    'chatbot' : './chatbot/index'
  },

  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'assets', 'js')
  },

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json', '.scss', '.svg' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src', 'examples/advanced', '..' ]

  },

  postcss: [ require('autoprefixer') ],

  module: {
    loaders: [
      {
        test     : /\.jsx*$/,
        exclude  : /node_modules/,
        loader   : 'babel',
        query    : {
          optional : ['runtime']
        }
      },
      {
        test    : /\.s*(c|a)ss$/,
        loader  : 'style!css!postcss!sass'
      },
      {
        test    : /\.(svg)$/,
        loader  : 'raw'
      }
    ]
  }
}
