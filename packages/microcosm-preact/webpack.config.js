var path = require('path')

module.exports = {
  devtool: 'inline-sourcemap',

  entry: {
    bundle: './example/example.js',
    vendor: ['microcosm', 'preact']
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'example')
  },

  resolve: {
    alias: {
      'microcosm-preact': path.resolve(__dirname, 'src', 'index.js')
    }
  },

  module: {
    loaders: [
      {
        test: /\.jsx*/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },

  devServer: {
    port: 3000,
    contentBase: path.resolve(__dirname, 'example')
  }
}
