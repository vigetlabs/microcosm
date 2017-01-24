const path = require('path')
const webpack = require('webpack')

const PORT = process.env.PORT || 3000

module.exports = {
  devtool: 'cheap-module-source-map',

  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:' + PORT,
    'webpack/hot/only-dev-server',
    path.resolve(process.cwd(), 'app/boot.js')
  ],

  output: {
    filename: 'application.js',
    path: process.cwd()
  },

  resolve: {
    alias: {
      'microcosm$': path.resolve(__dirname, '../src/microcosm.js'),
      'microcosm': path.resolve(__dirname, '../src/')
    }
  },

  module: {
    loaders: [{
      test: /\.jsx*/,
      loader: 'babel-loader',
      exclude: [/node_modules/],
      options: {
        cacheDirectory: '.babel-cache'
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
