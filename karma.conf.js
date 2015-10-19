module.exports = function (config) {
  config.set({
    browsers: [ 'Chrome' ],

    frameworks: [ 'mocha' ],

    files: [
      'test/**/*-test.js*',
      'examples/**/__tests__/*.js*'
    ],

    preprocessors: {
      'test/**/*.js*': [ 'webpack', 'sourcemap' ],
      'examples/**/__tests__/*.js*': [ 'webpack', 'sourcemap' ]
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

    webpack: {
      devtool: 'inline-source-map',

      resolve: {
        extensions: [ '', '.js', '.jsx', '.json', '.scss', '.svg' ],
        modulesDirectories: [ 'web_modules', 'node_modules' ]
      },

      module: {
        loaders: [{
          test: /\.jsx*$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            optional: ['runtime']
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
  })
}
