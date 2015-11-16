export default function getExamples(server) {
  let plugins = Object.keys(server.registrations).map(function(key) {
    return server.registrations[key].attributes
  })

  return plugins.filter(plugin => plugin.example)
}
