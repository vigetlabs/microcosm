var Webpack = require('webpack')

module.exports = {
  resolve: {
    extensions: [ '', '.js', '.jsx', '.json', '.scss', '.svg' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src', 'examples/advanced' ],
    alias: {
      react: 'react/dist/react.min.js'
    }
  },

  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],

  module: {
    noParse: [ 'react' ],
    loaders: [{
      test     : /\.jsx*$/,
      exclude  : /node_modules/,
      loader   : 'babel'
    }]
  }
}
