'use strict'

const server = require('./lib/server')
const base = require('../webpack.config')

module.exports = function (env) {
  let config = base(env)

  // Setup the webpack dev server to include our API endpoints
  config.devServer.setup = server

  return config
}
