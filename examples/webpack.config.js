var HappyPack = require('happypack')
var path = require('path')

module.exports = {
  context: path.resolve(__dirname, '..'),

  devtool: 'inline-source-map',

  output: {
    filename : '[name].js',
    path     : process.cwd()
  },

  plugins: [
    new HappyPack({
      id: 'examples'
    }),
    function Logger () {
      this.plugin("done", function (stats) {
        console.log("Built in %sms", stats.endTime - stats.startTime)
      })
    }
  ],

  resolve: {
    extensions: [ '', '.js', '.jsx' ],
    alias: {
      'microcosm': path.resolve(__dirname, '..', 'src')
    }
  },

  module: {
    loaders: [{
      test: /\.jsx*/,
      loader: 'babel',
      exclude: [/node_modules/],
      happy: { id: "examples" }
    }]
  },

  devServer: {
    contentBase: process.cwd(),
    publicPath: '/',
    port: process.env.PORT || 4000,
    noInfo: true,
    historyApiFallback: true
  }
}
