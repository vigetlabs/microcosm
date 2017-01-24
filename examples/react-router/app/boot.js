import React     from 'react'
import DOM       from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import Debugger  from 'microcosm-debugger'
import Repo      from './repo'
import routes    from './routes'

import { Router, browserHistory } from 'react-router'

const repo = new Repo({ maxHistory: Infinity })
const el = document.getElementById('app')

// Install the debugger
Debugger(repo)

function render (routes) {
  DOM.render((
    <Presenter repo={repo}>
      <Router history={browserHistory} routes={routes} />
    </Presenter>
  ), el)
}

render(routes)

if (module.hot) {
  module.hot.accept('./routes', function () {
    DOM.unmountComponentAtNode(el)
    render(require('./routes').default)
  })
}
