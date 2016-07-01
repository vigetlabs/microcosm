import React    from 'react'
import DOM      from 'react-dom'
import Provider from 'microcosm/addons/provider'
import Routes   from './app/routes'
import Todos    from './app/todos'
import Debugger from 'microcosm-debugger'

import { Router, browserHistory } from 'react-router'

const app = new Todos({ maxHistory: Infinity })

const Root = (
  <Provider app={ app }>
    <Router history={ browserHistory }>
      { Routes }
    </Router>
  </Provider>
)

DOM.render(Root, document.getElementById('app'))

Debugger(app)
