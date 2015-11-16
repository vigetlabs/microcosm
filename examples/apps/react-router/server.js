/**
 * This is the main server entry point into the
 * react-router example.
 */

import DOM   from 'react-dom/server'
import React from 'react'
import Todos from './app/todos'
import Router from 'react-router'
import Routes from './app/components/routes'

export default function register (server, _options, next) {

  server.route({
    method  : 'GET',
    path    : '/{path*}',
    handler(request, reply) {
      let app = new Todos()

      app.start(function(error) {
        if (error) throw error

        Router.run(Routes, request.url.href, function (Handler, state) {
          reply.view('apps/react-router/index', {
            markup: DOM.renderToString(React.createElement(Handler, { app, ...state })),
            payload: JSON.stringify(app)
          })
        })
      })
    }
  })

  next()

}

register.attributes = {
  name        : 'ReactRouter',
  description : 'Using Microcosm with ReactRouter.',
  example     : true,
  path        : '/react-router'
}
