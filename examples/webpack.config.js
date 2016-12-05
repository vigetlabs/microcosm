var path = require('path')

module.exports = {
  context: __dirname,

  devtool: 'inline-source-map',

  output: {
    filename : 'application.js',
    path     : process.cwd()
  },

  resolve: {
    extensions: [ '', '.js', '.jsx' ],
    alias: {
      'microcosm$': path.resolve(__dirname, '../src/microcosm.js'),
      'microcosm': path.resolve(__dirname, '../src/')
    }
  },

  module: {
    loaders: [{
      test: /\.jsx*/,
      loader: 'babel',
      exclude: [/node_modules/]
    }]
  },

  devServer: {
    contentBase: process.cwd(),
    publicPath: '/',
    port: process.env.PORT || 4000,
    historyApiFallback: true
  }
}
