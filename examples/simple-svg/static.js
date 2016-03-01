/**
 * This is the main server entry point into the
 * simple-svg example.
 */

import DOM       from 'react-dom/server'
import React     from 'react'
import SimpleSVG from './app/simple-svg'
import Viget     from './app/components/Viget'
import template  from './template.html'

export default function render (locals, next) {
  let app = new SimpleSVG()

  app.start(function (error) {
    let markup = DOM.renderToString(React.createElement(Viget, app.state))
    let output = template({ markup, payload: JSON.stringify(app) })

    next(error, output)
  })
}
