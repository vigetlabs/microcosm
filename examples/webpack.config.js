var config = Object.create(require('../webpack.config'))
var path   = require('path')

config.context = __dirname
config.devtool = 'inline-source-map'

config.entry = {
  'advanced' : './advanced/src/index',
  'simple-svg' : './simple-svg/index'
}

config.output = {
  filename: '[name].js',
  path: path.join(__dirname, 'assets', 'js')
}

config.module.loaders = [
  {
    test     : /\.jsx*$/,
    exclude  : /node_modules/,
    loader   : 'babel',
    query    : {
    optional : ['runtime']
    }
  },
  {
    test    : /\.s*(c|a)ss$/,
    loader  : 'style!css!autoprefixer!sass'
  },
  {
    test    : /\.(svg)$/,
    loader  : 'raw'
  }
]

module.exports = config
