var Webpack        = require('webpack')
var webpack_config = require('./webpack.config')

module.exports = function(config) {
  config.set({
    browsers: [ 'Chrome' ],

    frameworks: [ 'mocha', 'sinon-chai' ],

    autoWatchBatchDelay: 400,

    files: [
      'src/**/__tests__/*.js*',
      'examples/**/__tests__/*.js*',
      'addons/**/__tests__/*.js*'
    ],

    preprocessors: {
      'src/**/__tests__/*.js*' : [ 'webpack', 'sourcemap' ],
      'examples/**/__tests__/*.js*' : [ 'webpack', 'sourcemap' ],
      'addons/**/__tests__/*.js*' : [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'mocha', 'coverage' ],

    mochaReporter: {
      output: 'minimal'
    },

    client: {
      mocha: {
        timeout: 500
      }
    },

    coverageReporter: {
      dir    : process.env.CIRCLE_ARTIFACTS || 'coverage',
      type   : 'html',
      subdir : '.'
    },

    webpack: {
      devtool : 'inline-source-map',
      resolve : webpack_config.resolve,

      module: {
        noParse: webpack_config.module.noParse,
        loaders: [{
          test    : /\.jsx*$/,
          exclude : /node_modules/,
          loader  : 'babel',
          query   : {
            auxiliaryCommentBefore: "istanbul ignore next",
            optional: ["runtime"]
          }
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
