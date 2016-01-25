/**
 * This is the main server entry point into the
 * drawing example.
 */

import DOM      from 'react-dom/server'
import Drawing  from './app/components/drawing'
import React    from 'react'
import UndoTree from './app/undo-tree'

export default function register (server, _options, next) {

  server.route({
    method  : 'GET',
    path    : '/',
    handler(request, reply) {
      var app = new UndoTree()

      app.start(function(error) {
        if (error) {
          throw error
        }

        return reply.view('undo-tree/index', {
          markup : DOM.renderToString(React.createElement(Drawing, { app }))
        })
      })
    }
  })

  next()

}

register.attributes = {
  name        : 'Undo Tree',
  description : 'A simple drawing app visualizing the Microcosm transaction tree.',
  example     : true,
  path        : '/undo-tree'
}
