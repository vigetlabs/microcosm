import React from 'react'
import DOM from 'react-dom'
import { Router } from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import Repo from './repo'
import Application from './views/application'

// We're creating a browser history first, so that we can pass it
// into Microcosm. This lets us take advantage of the router when
// dispatching actions.
//
// See ./effects/routing.js
const browserHistory = createBrowserHistory()

const repo = new Repo({ browserHistory })

DOM.render(
  <Router history={browserHistory}>
    <Application repo={repo} />
  </Router>,
  document.getElementById('app')
)
