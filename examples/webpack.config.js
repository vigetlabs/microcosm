/**
 * Follows
 * https://webpack.js.org/guides/hmr-react/
 */

const webpack = require('webpack')
const { resolve } = require('path')

const PORT = process.env.PORT || 3000

module.exports = {
  devtool: 'cheap-module-inline-source-map',

  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:' + PORT,
    'webpack/hot/only-dev-server',
    resolve(process.cwd(), 'app/boot.js')
  ],

  output: {
    filename: 'application.js',
    path: process.cwd(),
    publicPath: '/'
  },

  context: resolve(process.cwd()),

  resolve: {
    alias: {
      'microcosm$': resolve(__dirname, '../src/microcosm.js'),
      'microcosm': resolve(__dirname, '../src/')
    }
  },

  module: {
    loaders: [{
      test: /\.jsx*/,
      loader: 'babel-loader',
      exclude: [/node_modules/],
      options: {
        cacheDirectory: '.babel-cache',
        plugins: ["react-hot-loader/babel"]
      }
    }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ],

  devServer: {
    hot: true,
    contentBase: process.cwd(),
    publicPath: '/',
    compress: true,
    historyApiFallback: true,
    port: PORT
  }
}
