/**
 * This is the main server entry point into the
 * simple-svg example.
 */

import DOM       from 'react-dom/server'
import React     from 'react'
import SimpleSVG from './app/simple-svg'
import View      from './app/view'
import template  from './template.html'

export default function render (locals, next) {
  const app = new SimpleSVG()

  const markup = DOM.renderToString(React.createElement(View, app.state))
  const output = template({ markup, payload: JSON.stringify(app) })

  next(null, output)
}
