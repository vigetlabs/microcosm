const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './example/index.js',
  output: {
    filename: 'microcosm-http.js',
    path: path.resolve('example/build')
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './example/index.html'
    })
  ],
  resolve: {
    alias: {
      'microcosm-http': path.resolve(__dirname, 'src/http.js'),
      microcosm: path.resolve(__dirname, '../microcosm/src/')
    }
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      }
    ]
  },
  devServer: {
    port: 3000,
    contentBase: path.resolve(__dirname, 'example'),
    setup: app => {
      const multer = require('multer')
      const bodyParser = require('body-parser')
      const upload = multer({ dest: 'example/uploads' })

      app.use(bodyParser.json())
      app.use(bodyParser.urlencoded({ extended: true }))

      app.post('/files', upload.array('files', 100), function(req, res, next) {
        res.json(req.body)
      })
    }
  }
}
