/**
 * This is the main server entry point into the
 * react-router example.
 */

import DOM      from 'react-dom/server'
import Provider from '../../src/addons/provider'
import React    from 'react'
import Todos    from './app/todos'
import routes   from './app/routes'
import template from './template.html'

import {match, RoutingContext} from 'react-router'

export default function render (locals, next) {
  let app = new Todos()

  app.start(function (error) {
    if (error) throw error

    match({ routes, location: '/' }, function (error, redirect, props) {
      let markup = DOM.renderToString(<Provider app={ app }><RoutingContext{ ...props } /></Provider>)
      let output = template({ basename: locals.path, markup, payload: JSON.stringify(app) })

      next(error, output)
    })
  })
}
