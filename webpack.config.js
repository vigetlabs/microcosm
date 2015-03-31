var Webpack = require('webpack')
var Path    = require('path')

module.exports = {
  devtool : 'source-map',

  entry: {
    Microcosm  : './src/index.js',
    Upstream   : './src/Upstream',
    Downstream : './src/Downstream'
  },

  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: Path.join(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: '[resource-path]'
  },

  plugins: [],

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src' ]
  },

  module: {
    loaders: [
      {
        test    : /\.jsx*$/,
        exclude : /node_modules/,
        loader  : 'babel?experimental&loose'
      },
      {
        test    : /\.json$/,
        loader  : 'json'
      }
    ]
  }
}
