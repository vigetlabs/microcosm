export function getExamples(server) {
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
