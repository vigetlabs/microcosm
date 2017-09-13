var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var alias = require('../alias')

module.exports = {
  context: __dirname,

  entry: {
    devtools: ['./src/devtools.js'],
    backend: './src/backend.js',
    hook: './src/hook.js',
    target: './target/index.js'
  },
  output: {
    path: __dirname + '/build',
    publicPath: '/build/',
    filename: '[name].js'
  },
  resolve: {
    alias: alias
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        include: [/src/, /shell/],
        use: [
          {
            loader: 'eslint-loader',
            options: {
              cache: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.css/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              importLoaders: 1,
              localIdentName: '[path]-[name]-[local]'
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 0 }
          }
        ]
      }
    ]
  },
  performance: {
    hints: false
  },
  devtool: '#cheap-eval-source-map',
  devServer: {
    quiet: true,
    contentBase: __dirname
  },
  plugins: [new FriendlyErrorsPlugin()]
}
