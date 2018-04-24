const HTMLWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const server = require('./lib/server')

module.exports = {
  devtool: 'source-map',
  plugins: [
    new HTMLWebpackPlugin({
      template: 'public/index.html'
    })
  ],
  resolve: {
    alias: {
      microcosm: path.resolve(__dirname, '../../microcosm/src/'),
      'microcosm-dom': path.resolve(__dirname, '../../microcosm-dom/src/react')
    }
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    before: server,
    port: process.env.PORT || 3000,
    contentBase: path.resolve(__dirname, 'public')
  }
}
