module.exports = {
  context: __dirname,

  devtool: 'inline-source-map',

  output: {
    filename : 'application.js',
    path     : process.cwd()
  },

  resolve: {
    extensions: [ '', '.js', '.jsx' ]
  },

  module: {
    loaders: [{
      test: /\.jsx*/,
      loader: 'babel',
      exclude: [/node_modules/]
    }]
  },

  devServer: {
    contentBase: process.cwd(),
    publicPath: '/',
    port: process.env.PORT || 4000,
    historyApiFallback: true
  }
}
