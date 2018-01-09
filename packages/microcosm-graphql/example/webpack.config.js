'use strict'

const HTMLPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const nodeModules = require('fs').readdirSync(
  __dirname + '/../../../node_modules'
)

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
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    },
    {
      test: /\.json/,
      loader: 'json-loader'
    }
  ]
}

const resolve = {
  alias: {
    microcosm: path.resolve(__dirname, '../../microcosm/src/')
  }
}

module.exports = function() {
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
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      }
    ]
  }

  const resolve = {
    alias: {
      microcosm: path.resolve(__dirname, '../../microcosm/src/')
    }
  }

  return [
    {
      context: __dirname,
      entry: {
        lib: '../src/index'
      },
      devtool: 'sourcemap',
      externals: {
        microcosm: 'microcosm',
        'microcosm-http': 'microcosm-http'
      },
      node: {
        process: false,
        buffer: false
      },
      output: output,
      module: modules,
      resolve: resolve,
      plugins: [new webpack.optimize.ModuleConcatenationPlugin()]
    },
    {
      context: __dirname,
      entry: {
        client: './src/client'
      },
      devtool: 'sourcemap',
      output: output,
      module: modules,
      resolve: resolve,
      plugins: [new HTMLPlugin({ template: './index.html' })]
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
