/**
 * This is the main server entry point into the
 * undo-tree example.
 */

const path = '/undo-tree'

export default function register (server, _options, next) {

  server.route({
    method  : 'GET',
    path    : path,
    handler : {
      view: 'apps/undo-tree/index'
    }
  })

  next()

}

register.attributes = {
  name        : 'Undo Tree',
  description : 'A simple drawing app visualizing the Microcosm transaction tree.',
  example     : true,
  path        : path
}
