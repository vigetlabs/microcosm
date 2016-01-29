/**
 * Example Home
 * This server plugin creates an entry point to the "home page" of the examples
 * app. On render, it will check all registered plugins for examples and showcase
 * them in the HTML response.
 */

function getExamples (server) {
  let plugins = Object.keys(server.registrations).map(function(key) {
    return server.registrations[key].attributes
  })

  return plugins.filter(plugin => plugin.example)
}

export default function register (server, _options, next) {
  server.route({
    method  : 'GET',
    path    : '/',
    handler(request, reply) {
      reply.view('homepage/index', {
        examples: getExamples(request.server)
      })
    }
  })

  next()
}

register.attributes = {
  name: 'Homepage'
}
