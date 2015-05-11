var Server  = require("webpack-dev-server")
var Webpack = require("webpack")
var config  = require('./webpack.config')

var server = new Server(Webpack(config), {
  hot: true,
  contentBase: './example',
  noInfo: true,
  stats: { colors: true },
  historyApiFallback: true
});

server.listen(8080, "localhost", function() {
  console.log("Server is listening on 8080")
});
