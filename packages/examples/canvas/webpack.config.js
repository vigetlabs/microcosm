const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  plugins: [
    new HTMLWebpackPlugin({
      template: 'public/index.html'
    })
  ],
  resolve: {
    alias: {
      microcosm: path.resolve(__dirname, '../../microcosm/src/')
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
  }
}
