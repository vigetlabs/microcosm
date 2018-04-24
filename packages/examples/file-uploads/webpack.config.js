const HTMLWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const multer = require('multer')
const bodyParser = require('body-parser')

module.exports = {
  plugins: [
    new HTMLWebpackPlugin({
      template: 'public/index.html'
    })
  ],
  resolve: {
    alias: {
      microcosm: path.resolve(__dirname, '../../microcosm/src/'),
      'microcosm-http': path.resolve(
        __dirname,
        '../../microcosm-http/src/http.js'
      ),
      'microcosm-dom': path.resolve(__dirname, '../../microcosm-dom/src/react')
    }
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    before: app => {
      const upload = multer({ dest: `${__dirname}/public/uploads` })

      app.use(bodyParser.json())
      app.use(bodyParser.urlencoded({ extended: true }))

      app.post('/files', upload.array('files', 100), function(req, res, next) {
        res.json(req.body)
      })
    }
  }
}
