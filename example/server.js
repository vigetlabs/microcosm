var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");
var config = require('../webpack.example.config')

var compiler = webpack(config)

var server = new WebpackDevServer(compiler, {
  hot: true,
  contentBase: './example',
  noInfo: true,
  stats: { colors: true },
  historyApiFallback: true
});

server.listen(8080, "localhost", function() {
  console.log("Server is listening on 8080")
});
