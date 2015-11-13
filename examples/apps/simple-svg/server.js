/**
 * This is the main server entry point into the
 * simple-svg example.
 */

export default function register (server, _options, next) {

  server.route({
    method  : 'GET',
    path    : '/simple-svg',
    handler : {
      view: 'apps/simple-svg/index'
    }
  })

  next()

}

register.attributes = {
  name        : 'Simple SVG',
  description : 'A simple animation of the Viget logo.',
  example     : true,
  path        : '/simple-svg'
}
