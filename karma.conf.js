var Webpack = require('webpack')
var webpack_config = require('./webpack.config')

module.exports = function(config) {
  config.set({

    browsers: [ process.env.CONTINUOUS_INTEGRATION === 'true' ? 'Firefox' : 'Chrome' ],

    singleRun: process.env.CONTINUOUS_INTEGRATION === 'true',

    frameworks: [ 'mocha', 'sinon-chai' ],

    logLevel: config.LOG_ERROR,

    files: [
      { pattern: 'test/*.json', watched: false, included: false, served: true },
      { pattern: 'test/*.jpg',  watched: false, included: false, served: true },
      'src/**/__tests__/*.js*',
      'lib/**/__tests__/*.js*'
    ],

    preprocessors: {
      'src/**/__tests__/*.js*': [ 'webpack' ],
      'lib/**/__tests__/*.js*': [ 'webpack' ]
    },

    reporters: [ 'nyan', 'coverage' ],

    coverageReporter: {
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' }
      ]
    },

    webpack: {
      devtool: webpack_config.devtool,
      plugins: webpack_config.plugins,
      resolve: webpack_config.resolve,

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
