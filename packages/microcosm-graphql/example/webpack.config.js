'use strict'

const HTMLPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const nodeModules = require('fs').readdirSync(
  __dirname + '/../../../node_modules'
)

module.exports = function() {
  return [
    {
      context: __dirname,
      entry: {
        client: './src/client'
      },
      devtool: 'sourcemap',
      output: output,
      module: modules,
      resolve: resolve,
      plugins: [new HTMLPlugin()]
    },
    {
      context: __dirname,
      entry: {
        server: './src/server'
      },
      devtool: 'sourcemap',
      output: output,
      target: 'node',
      module: modules,
      resolve: resolve,
      externals: nodeModules.reduce(function(memo, next) {
        if (next.indexOf('.bin') < 0 && next.indexOf('microcosm') < 0) {
          memo[next] = 'commonjs ' + next
        }
        return memo
      }, {}),
      plugins: [
        new webpack.BannerPlugin({
          banner: 'require("source-map-support").install();',
          raw: true,
          entryOnly: false
        })
      ]
    }
  ]
}

const output = {
  filename: '[name].js',
  path: path.resolve(__dirname, 'build')
}

const modules = {
  rules: [
    {
      test: /\.gql$/,
      loader: 'graphql-tag/loader'
    },
    {
      test: /\.jsx*$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }
  ]
}

console.log(path.resolve(__dirname, '../../microcosm/src/'))

const resolve = {
  alias: {
    'microcosm-graphql': path.resolve(__dirname, '../src/index.js'),
    microcosm$: path.resolve(__dirname, '../../microcosm/src/microcosm'),
    'microcosm/': path.resolve(__dirname, '../../microcosm/src/')
  }
}
