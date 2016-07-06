var path = require('path')
var root = process.cwd()

if (root === __dirname) {
  console.log("\nHalt! Run `npm start` inside of an example, like:\n")
  console.log("  $ cd simple-svg")
  console.log("  $ npm start\n")

  process.exit(1)
}

module.exports = {
  context: root,

  devtool: 'inline-source-map',

  entry: {
    'application'  : './app/boot'
  },

  output: {
    filename : '[name].js'
  },

  resolve: {
    extensions: [ '', '.js', '.jsx' ],
    alias: {
      'microcosm': path.resolve(__dirname, '../src'),
      'microcosm-debugger': path.resolve(__dirname, '../../microcosm-debugger/dist/microcosm-debugger')
    }
  },

  module: {
    loaders: [{
      test     : /\.jsx*$/,
      loader   : 'babel',
      exclude  : /node_modules/
    }]
  },

  devServer: {
    contentBase: root,
    publicPath: '/',
    port: process.env.PORT || 4000,
    noInfo: true,
    historyApiFallback: true
  }
}
