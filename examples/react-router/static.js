/**
 * This is the main server entry point into the
 * react-router example.
 */

import React    from 'react'
import DOM      from 'react-dom/server'
import Provider from 'microcosm/addons/provider'
import Todos    from './app/todos'
import routes   from './app/routes'
import template from './template.html'

import {match, RouterContext} from 'react-router'

export default function render (locals, next) {
  let app = new Todos()

  match({ routes, location: '/react-router' }, function (error, redirect, props) {
    let markup = DOM.renderToString(<Provider app={ app }><RouterContext{ ...props } /></Provider>)
    let output = template({ basename: locals.path, markup })

    next(error, output)
  })
}
