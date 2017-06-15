import React from 'react'
import DOM from 'react-dom'
import { Router } from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import { AppContainer } from 'react-hot-loader'
import Repo from './repo'
import Layout from './views/layout'

const el = document.getElementById('app')
const browserHistory = createBrowserHistory()
const repo = new Repo({ maxHistory: Infinity, browserHistory })

function render() {
  DOM.render(
    <Router history={browserHistory}>
      <AppContainer>
        <Layout repo={repo} />
      </AppContainer>
    </Router>,
    el
  )
}

render()

if (module.hot) {
  module.hot.accept('./views/layout', render)
}
