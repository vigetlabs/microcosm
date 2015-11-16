/**
 * This is the main server entry point into the
 * simple-svg example.
 */

import DOM       from 'react-dom/server'
import React     from 'react'
import SimpleSVG from './app/simple-svg'
import Viget     from './app/components/Viget'

export default function register (server, _options, next) {

  server.route({
    method : 'GET',
    path   : '/',

    handler(request, reply) {
      var app = new SimpleSVG()

      app.start(function(error) {
        if (error) throw error

        return reply.view('apps/simple-svg/index', {
          markup  : DOM.renderToString(React.createElement(Viget, app.state)),
          payload : JSON.stringify(app)
        })
      })
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
