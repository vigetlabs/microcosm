/**
 * This is the main server entry point into the
 * react-router example.
 */

const path = '/react-router'

export default function register (server, _options, next) {

  server.route({
    method  : 'GET',
    path    : path,
    handler : {
      view: 'apps/react-router/index'
    }
  })

  next()

}

register.attributes = {
  name        : 'ReactRouter',
  description : 'Using Microcosm with ReactRouter.',
  example     : true,
  path        : path
}
