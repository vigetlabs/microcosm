var Webpack = require('webpack')

module.exports = {
  devtool : '#eval-source-map',

  entry: [
    "webpack-dev-server/client?http://localhost:8080",
    'webpack/hot/only-dev-server',
    './example/src/index.jsx'
  ],

  output: {
    filename: 'example/assets/js/application.js',
    path: __dirname + '/example',
    publicPath: '/'
  },

  resolve: {
    extensions: [ '', '.js', '.jsx', '.json', '.scss', '.svg' ],
    modulesDirectories: [ 'web_modules', 'node_modules', 'src', 'example/src/components', 'example/assets', 'example/lib', 'example/src' ]
  },

  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoErrorsPlugin(),
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],

  node: {
    console: false,
    process: false,
    global: true,
    Buffer: false,
    __filename: 'mock',
    __dirname: 'mock'
  },

  postcss: [
    require('autoprefixer-core'),
    require('css-mqpacker'),
    require('csswring')
  ],

  module: {
    loaders: [
      {
        test    : /\.s*(c|a)ss$/,
        loader  : 'style!css!postcss!sass'
      },
      {
        test    : /\.jsx*$/,
        exclude : /node_modules/,
        loader  : 'react-hot!babel?experimental&loose'
      },
      {
        test    : /\.json$/,
        loader  : 'json'
      },
      {
        test    : /\.(svg)$/,
        loader  : 'raw'
      },
    ]
  }
}
