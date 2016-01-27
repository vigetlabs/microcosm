/**
 * Render
 * Render changes to the screen
 */

import DOM from 'react-dom'
import Provider from '../../../../src/addons/provider'
import React from 'react'
import Routes from '../routes'
import {Router} from 'react-router'
import {useBasename, createHistory} from 'history'

export default function Render (app, el) {
  let Root = (
    <Provider app={ app }>
      <Router history={ useBasename(createHistory)() }>
        { Routes }
      </Router>
    </Provider>
  )

  DOM.render(Root, el)
}
