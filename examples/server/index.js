/**
 * We'll use ES6 in our server-side code for consistency.
 * This pulls in Babel as a preprocessor for future code
 * required by Node.
 */
require('babel/register')

var Server = require('./lib/server')

Server.start(process.env.PORT || 4000, function (error, server) {
  if (error) {
    throw Error(error)
  }

  console.log('[info] Examples listening on %s', server.info.uri)
})
