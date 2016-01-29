require('babel/register')

var Server   = require('./lib/server')
var assert   = require('assert')
var manifest = require('./config/manifest')

Server.init(manifest.server, manifest.options, function (error, server) {
  assert.ifError(error)
  server.log(['info'], 'Server is running at ' + server.info.uri)
})
