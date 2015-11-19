/**
 * This is the main server entry point into the
 * react-router example.
 *
 * Inspired heavily from:
 * https://github.com/rackt/react-router/blob/master/docs/guides/advanced/ServerRendering.md
 */

import DOM from 'react-dom/server'
import React from 'react'
import Todos from './app/todos'
import routes from './app/components/routes'
import { match, RoutingContext } from 'react-router'

const basename = '/react-router'

export default function register (server, _options, next) {

  server.route({
    method  : 'GET',
    path    : '/{path*}',
    handler(request, reply) {
      let app = new Todos()

      let params = { basename, routes, location: request.raw.req.url }

      function createElement (Handler, state) {
        return (<Handler app={ app } { ...state } />)
      }

      app.start(function (error) {
        if (error) throw error

        match(params, function (error, redirect, props) {
          if (error) {
            return reply.view('server/error', error).code(500)
          }

          if (redirect) {
            return reply.redirect(redirect.pathname + redirect.search)
          }

          if (props) {
            return reply.view('apps/react-router/index', {
              markup  : DOM.renderToString(<RoutingContext createElement={ createElement } { ...props } />),
              payload : JSON.stringify(app)
            })
          }

          return reply('Page not found').code(404)
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
  path        : basename
}
