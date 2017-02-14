import React from 'react'
import DOM from 'react-dom'
import Router from 'react-router-dom/BrowserRouter'
import Debugger from 'microcosm-debugger'
import Repo from './repo'
import Layout from './views/layout'

const el = document.getElementById('app')
const repo = new Repo({ maxHistory: Infinity })

Debugger(repo)

function render () {
  DOM.render((
    <Router>
      <Layout repo={repo} />
    </Router>
  ), el)
}

render()

if (module.hot) {
  module.hot.accept(render)
}
