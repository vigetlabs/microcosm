var Webpack = require('webpack')

module.exports = {
  resolve: {
    extensions: [ '', '.js', '.jsx', '.json', '.scss', '.svg' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src', 'examples/advanced' ]
  },

  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],

  module: {
    loaders: [{
      test     : /\.jsx*$/,
      exclude  : /node_modules/,
      loader   : 'babel'
    }]
  }
}
