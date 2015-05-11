var Webpack = require('webpack')

module.exports = {
  devtool : 'source-map',

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json', '.scss', '.svg' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src', 'example' ]
  },

  module: {
    loaders: [
      {
        test    : /\.jsx*$/,
        exclude : /node_modules/,
        loader  : 'babel'
      },
      {
        test    : /\.(svg)$/,
        loader  : 'raw'
      },
    ]
  }
}
