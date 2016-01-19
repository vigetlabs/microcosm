/**
 * Render
 * Render changes to the screen
 */

import DOM from 'react-dom'
import React from 'react'
import Routes from '../routes'
import {Router} from 'react-router'
import {useBasename, createHistory} from 'history'

export default function Render (app, el) {
  function createElement (Handler, state) {
    return (<Handler app={ app } { ...state } />)
  }

  let router = (
    <Router history={ useBasename(createHistory)() } createElement={ createElement }>
      { Routes }
    </Router>
  )

  return DOM.render(router, el)
}
