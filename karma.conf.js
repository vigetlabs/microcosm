var path = require('path')

module.exports = function (config) {
  var fullSweep = process.env.CI || config.full
  var withCoverage = process.env.CI || config.coverage

  config.set({
    browsers: fullSweep ? ['Chrome', 'Firefox'] : ['Chrome'],

    frameworks: [ 'mocha' ],

    files: [
      'test/**/*-test.js*',
      'examples/**/*-test.js*'
    ],

    singleRun: !config.watch,

    preprocessors: {
      'test/**/*-test.js*': [ 'webpack', 'sourcemap' ],
      'examples/**/*-test.js*': [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'mocha' ],

    coverageReporter: {
      dir: process.env.CIRCLE_ARTIFACTS || 'coverage',
      type: 'html',
      subdir: '.'
    },

    mochaReporter: {
      output: 'minimal'
    },

    webpackMiddleware: {
      noInfo: true
    },

    webpack: {
      devtool: 'inline-source-map',

      resolve: {
        extensions: [ '', '.js', '.jsx', '.json' ],
        alias: {
          'microcosm': path.resolve(__dirname, 'src')
        }
      },

      externals: {
        // https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      },

      module: {
        loaders: [
          {
            test     : /\.jsx*$/,
            loader   : 'babel',
            exclude  : /node_modules/
          },
          {
            test     : /\.json$/,
            loader   : 'json'
          }
        ],
        postLoaders: withCoverage ? [{
          test    : /\.jsx*/,
          exclude : /(test|__tests__|node_modules)\//,
          loader  : 'istanbul-instrumenter'
        }] : null
      }
    }
  })
}
