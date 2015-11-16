/**
 * Example Home
 * This server plugin creates an entry point to the "home page" of the examples
 * app. On render, it will check all registered plugins for examples and showcase
 * them in the HTML response.
 */

import getExamples from './getExamples'

export default function register (server, _options, next) {

  server.route({
    method  : 'GET',
    path    : '/',
    handler(request, reply) {
      reply.view('server/index', {
        examples: getExamples(request.server)
      })
    }
  })

  next()

}

register.attributes = {
  name: 'Examples'
}
