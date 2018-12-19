/**
 * Follows
 * https://webpack.js.org/guides/hmr-react/
 */

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { resolve } = require('path')

const PORT = process.env.PORT || 3000

module.exports = function(env) {
  let isDev = env !== 'production'
  let root = process.cwd()

  process.env.BABEL_ENV = isDev ? 'development' : 'production'

  return {
    context: root,

    devtool: isDev ? 'cheap-module-inline-source-map' : 'source-map',

    entry: {
      application: ['./app/boot.js']
    },

    output: {
      filename: '[name].[hash].js',
      path: resolve(root, 'build'),
      publicPath: '/'
    },

    resolve: {
      alias: {
        microcosm$: resolve(__dirname, '../src/microcosm.js'),
        microcosm: resolve(__dirname, '../src/')
      }
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            plugins: [['transform-runtime', { polyfill: false }]]
          }
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: resolve(root, 'public/index.html')
      })
    ],

    devServer: {
      contentBase: resolve(root, 'public'),
      publicPath: '/',
      compress: true,
      historyApiFallback: true,
      port: PORT
    }
  }
}
