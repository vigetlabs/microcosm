/**
 * Follows
 * https://webpack.js.org/guides/hmr-react/
 */

const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { resolve } = require('path')

const PORT = process.env.PORT || 3000

module.exports = function (env) {
  let isDev = env !== 'production'
  let root = process.cwd()

  process.env.BABEL_ENV = isDev ? 'development' : 'production'

  let config = {
    context: root,

    devtool: 'source-map',

    entry: {
      'application': './app/boot.js'
    },

    output: {
      filename: '[name].[hash].js',
      path: resolve(root, 'build'),
      publicPath: '/'
    },

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
          cacheDirectory: '.babel-cache'
        }
      }]
    },

    plugins: [
      new Webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: resolve(root, 'public/index.html')
      }),
      new Webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          var context = module.context

          if (context == null) {
            return false
          }

          return context.includes('node_modules') || context.includes('microcosm/src')
        }
      })
    ],

    node: {
      global: true,
      console: false,
      process: false,
      Buffer: false,
      __filename: "mock",
      __dirname: "mock",
      setImmediate: false
    },

    devServer: {
      hot: isDev,
      contentBase: resolve(root, 'public'),
      publicPath: '/',
      compress: true,
      historyApiFallback: true,
      port: PORT
    }
  }

  if (isDev) {
    config.devtool = 'cheap-module-inline-source-map'

    config.entry['dev'] = [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:' + PORT,
      'webpack/hot/only-dev-server'
    ]

    config.plugins.unshift(
      new Webpack.HotModuleReplacementPlugin(),
      new Webpack.NamedModulesPlugin()
    )
  }

  return config
}
