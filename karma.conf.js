var Webpack = require('webpack')
var webpack_config = require('./webpack.config')

var isIntegration = process.env.CONTINUOUS_INTEGRATION

module.exports = function(config) {
  config.set({

    browsers: [ isIntegration === 'true' ? 'Firefox' : 'Chrome' ],

    singleRun: isIntegration === 'true',

    frameworks: [ 'mocha', 'sinon-chai' ],

    logLevel: config.LOG_ERROR,

    files: [ 'tests.webpack.js' ],

    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'nyan', 'coverage' ],

    coverageReporter: {
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' }
      ]
    },

    webpack: {
      devtool : 'inline-source-map',
      plugins : webpack_config.plugins,
      resolve : webpack_config.resolve,

      module: {
        loaders: webpack_config.module.loaders,
        postLoaders: [
          {
            test: /\.jsx*$/,
            exclude: /(__tests__|node_modules)\//,
            loader: 'istanbul-instrumenter'
          }
        ]
      }
    },

    webpackServer: {
      noInfo: true
    }
  });
};
