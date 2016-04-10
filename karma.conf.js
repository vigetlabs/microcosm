var HappyPack = require('happypack')
var path = require('path')

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS' ],

    frameworks: [ 'mocha' ],

    files: [
      'test/**/*-test.js*',
      'examples/*/test/**/*-test.js*'
    ],

    preprocessors: {
      'test/**/*.js*': [ 'webpack'],
      'examples/*/test/**/*-test.js*': [ 'webpack']
    },

    reporters: [ 'mocha' ],

    mochaReporter: {
      output: 'minimal'
    },

    coverageReporter: {
      dir: process.env.CIRCLE_ARTIFACTS || 'coverage',
      type: 'html',
      subdir: '.'
    },

    webpackMiddleware: {
      noInfo: true
    },

    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        extensions: [ '', '.js', '.jsx', '.json' ],
        modulesDirectories: [ 'node_modules' ]
      },

      module: {
        loaders: [{
          test: /\.jsx*$/,
          exclude: /node_modules/,
          loader: 'happypack/loader',
        }]
      },

      plugins: [
        new HappyPack({
          loaders: [ 'babel?optional=runtime' ]
        })
      ]
    }
  })
}
