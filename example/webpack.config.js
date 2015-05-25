var Webpack = require("webpack")
var config = Object.create(require('../webpack.config'))

config.devtool = '#eval-source-map'

config.entry = [
  "webpack-dev-server/client?http://localhost:8080",
  'webpack/hot/only-dev-server',
  './example/src/index.jsx'
]

config.output = {
  filename: 'example/assets/js/application.js',
  path: __dirname + '/example',
  publicPath: '/'
}

config.plugins = [
  new Webpack.HotModuleReplacementPlugin()
]

config.module.loaders.unshift(
  {
    test    : /\.s*(c|a)ss$/,
    loader  : 'style!css!autoprefixer!sass'
  },
  {
    test    : /\.jsx*$/,
    exclude : /node_modules/,
    loader  : 'react-hot'
  }
)

module.exports = config
