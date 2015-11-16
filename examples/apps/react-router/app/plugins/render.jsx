/**
 * Render
 * Render changes to the screen
 */

import DOM    from 'react-dom'
import React  from 'react'
import Router from 'react-router'
import Routes from '../components/routes'

export default function register(app, el, next) {
  // Developer courtesy here. If the plugin isn't given renderable target, let
  // the developer know.
  if (!el) {
    throw TypeError('Render plugin was unable to render to the target ' + el);
  }

  Router.run(Routes, Router.HistoryLocation, function (Handler, state) {
    DOM.render(<Handler { ...state } app={ app } />, el)
  })

  next()
}
