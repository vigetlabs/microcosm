const { resolve } = require('path')

module.exports = {
  devtool: 'inline-sourcemap',

  entry: {
    bundle: './example/example.js'
  },

  output: {
    filename: '[name].js',
    path: resolve(__dirname, 'example')
  },

  resolve: {
    alias: {
      'microcosm-preact': resolve(__dirname, 'src/index.js'),
      microcosm: resolve(__dirname, '../microcosm/src/')
    }
  },

  module: {
    loaders: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      }
    ]
  },

  devServer: {
    port: 3000,
    contentBase: resolve(__dirname, 'example')
  }
}
