/**
 * Render
 * Render changes to the screen
 */

import React  from 'react'
import Router from '../router'

export default {
  register(app, { el }, next) {
    // Developer courtesy here. If the plugin isn't given renderable target, let
    // the developer know.
    if (!el) {
      throw TypeError('Render plugin was unable to render to the target ' + el);
    }

    Router.run(function(Handler, state) {
      React.render(<Handler { ...state } app={ app } />, el)
    })

    next()
  }
}
