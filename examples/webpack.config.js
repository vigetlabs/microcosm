var HappyPack = require('happypack')

module.exports = {
  context: __dirname,

  devtool: 'inline-source-map',

  output: {
    filename : 'application.js',
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
    extensions: [ '', '.js', '.jsx' ]
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
