var Webpack        = require('webpack')
var webpack_config = require('./webpack.config')

module.exports = function(config) {
  config.set({
    browsers: [ 'Chrome' ],

    frameworks: [ 'mocha', 'sinon-chai' ],

    autoWatchBatchDelay: 400,

    files: [
      'src/**/__tests__/*.js*',
      'example/src/**/__tests__/*.js*'
    ],

    preprocessors: {
      'src/**/__tests__/*.js*' : [ 'webpack', 'sourcemap' ],
      'example/src/**/__tests__/*.js*' : [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'spec', 'coverage' ],

    coverageReporter: {
      type: 'html',
      subdir: '.',
      dir: process.env.CIRCLE_ARTIFACTS || 'coverage'
    },

    webpack: {
      devtool : '#eval-source-map',
      resolve : webpack_config.resolve,

      module: {
        loaders: [{
          test    : /\.jsx*$/,
          exclude : /node_modules/,
          loader  : 'babel',
          query   : { optional: ['runtime'] }
        }],
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
