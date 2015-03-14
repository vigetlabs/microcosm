var Webpack = require('webpack')
var Path    = require('path')

module.exports = {
  devtool : 'source-map',

  entry: {
    Microcosm : './src/index.js'
  },

  output: {
    filename: '[name].js',
    libraryTarget: 'node',
    path: Path.join(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: '[resource-path]'
  },

  externals: {
    'react': 'react',
    'react/addons': 'react/addons',
    'react-immutable-render-mixin': 'react-immutable-render-mixin',
    'flux': 'flux',
    'immutable': 'immutable'
  },

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src' ]
  },

  module: {
    loaders: [
      {
        test    : /\.jsx*$/,
        exclude : /node_modules/,
        loader  : 'source-map!babel?experimental'
      },
      {
        test    : /\.json$/,
        loader  : 'json'
      }
    ]
  }
}
