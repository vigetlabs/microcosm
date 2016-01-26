/**
 * This is the main server entry point into the
 * undo-tree example.
 */

import DOM     from 'react-dom/server'
import Drawing from './app/components/drawing'
import React   from 'react'
import Painter from './app/painter'

export default function register (server, _options, next) {

  server.route({
    method  : 'GET',
    path    : '/',
    handler(request, reply) {
      var app = new Painter()

      app.start(function(error) {
        if (error) {
          throw error
        }

        return reply.view('painter/index', {
          markup : DOM.renderToString(React.createElement(Drawing, { app }))
        })
      })
    }
  })

  next()

}

register.attributes = {
  name        : 'Painter',
  description : 'A simple drawing app.',
  example     : true,
  path        : '/painter'
}
