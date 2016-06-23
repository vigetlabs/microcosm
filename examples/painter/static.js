/**
 * This is the main server entry point into the
 * undo-tree example.
 */

import DOM      from 'react-dom/server'
import Drawing  from './app/components/drawing'
import Painter  from './app/painter'
import React    from 'react'
import template from './template.html'

export default function render (locals, next) {
  let app = new Painter()

  let markup = DOM.renderToString(React.createElement(Drawing, { app }))
  let output = template({ markup })

  next(null, output)
}
