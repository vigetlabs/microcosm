var HappyPack = require('happypack')
var path = require('path')

module.exports = function (config) {
  var fullSweep = process.env.CI || config.full
  var withCoverage = process.env.CI || config.coverage

  config.set({
    browsers: fullSweep ? ['Chrome', 'Firefox', 'PhantomJS'] : [ 'PhantomJS' ],

    frameworks: [ 'mocha' ],

    files: [
      'test/**/*-test.js*',
      'examples/*/test/**/*-test.js*'
    ],

    singleRun: !config.watch,

    preprocessors: {
      'test/**/*.js*': [ 'webpack', 'sourcemap' ],
      'examples/*/test/**/*-test.js*': [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'mocha', 'coverage' ],

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

      plugins: [
        new HappyPack({ id: 'js' })
      ],

      module: {
        loaders: [{
          test: /\.jsx*$/,
          exclude: /node_modules/,
          loader: 'babel?optional=runtime',
          happy: { id: 'js' }
        }],
        postLoaders: withCoverage ? [{
          test: /\.jsx*$/,
          exclude: /(test|__tests__|node_modules)\//,
          loader: 'istanbul-instrumenter',
          happy: { id: 'js' }
        }] : null
      }
    }
  })
}
