var Webpack = require('webpack')
var Path    = require('path')

module.exports = {
  devtool : 'source-map',

  entry: {
    Microcosm : './src/index.js'
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

  externals: {
    diode: 'diode'
  },

  module: {
    loaders: [
      {
        test    : /\.jsx*$/,
        exclude : /node_modules/,
        loader  : 'babel',
        query   : {
          stage: 0,
          loose: true
        }
      },
      {
        test    : /\.json$/,
        loader  : 'json'
      }
    ]
  }
}
