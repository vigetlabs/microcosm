const HtmlPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  context: __dirname,
  entry: './src/index.js',
  plugins: [new HtmlPlugin({ inject: true })],
  resolve: {
    alias: {
      'microcosm-dom': path.resolve(
        __dirname,
        '../../microcosm-dom/src/react.js'
      ),
      microcosm: path.resolve(__dirname, '../../microcosm/src'),
      micromanage: path.resolve(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js*$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
}
