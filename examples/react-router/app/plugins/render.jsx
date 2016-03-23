/**
 * Render
 * Render changes to the screen
 */

import DOM from 'react-dom'
import Provider from '../../../../src/addons/provider'
import React from 'react'
import Routes from '../routes'
import { Router } from 'react-router'
import { browserHistory } from 'react-router'

export default function Render (app, el) {
  let Root = (
    <Provider app={ app }>
      <Router history={ browserHistory }>
        { Routes }
      </Router>
    </Provider>
  )

  DOM.render(Root, el)
}
