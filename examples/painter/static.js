/**
 * This is the main server entry point into the
 * undo-tree example.
 */

import DOM       from 'react-dom/server'
import React     from 'react'
import Painter   from './app/painter'
import Workspace from './app/presenters/workspace'
import template  from './template.html'

export default function render (locals, next) {
  let app = new Painter()

  let markup = DOM.renderToString(React.createElement(Workspace, { app }))
  let output = template({ markup })

  next(null, output)
}
