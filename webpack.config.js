var Webpack = require('webpack')

module.exports = {
  devtool : 'source-map',

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json', '.scss', '.svg' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src', 'example' ]
  },

  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],

  node: {
    process: false
  },

  module: {
    loaders: [
      {
        test     : /\.jsx*$/,
        exclude  : /node_modules/,
        loader   : 'babel',
        query    : {
          optional : [ 'utility.inlineEnvironmentVariables' ]
        }
      },
      {
        test    : /\.(svg)$/,
        loader  : 'raw'
      }
    ]
  }
}
