/**
 * Render
 * Render changes to the screen
 */

import React    from 'react'
import Routes   from '../components/routes'
import {Router} from 'react-router'
import {render} from 'react-dom'

export default function Render(app, el, next) {
  // Developer courtesy here. If the plugin isn't given renderable target, let
  // the developer know.
  if (!el) {
    return next(TypeError('Render plugin was unable to render to the target ' + el))
  }

  function createElement(Handler, state) {
    return (<Handler app={ app } { ...state } />)
  }

  render(<Router createElement={ createElement }>{ Routes }</Router>, el)

  next()
}
