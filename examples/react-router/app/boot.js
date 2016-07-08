import React     from 'react'
import DOM       from 'react-dom'
import Provider  from 'microcosm/addons/provider'
import Debugger  from 'microcosm-debugger'
import Todos     from './todos'
import routes    from './routes'

import { Router, browserHistory } from 'react-router'

const app = new Todos({ maxHistory: Infinity })

// Install the debugger
Debugger(app)

// Render
DOM.render((
  <Provider app={ app }>
    <Router history={ browserHistory } routes={ routes } />
  </Provider>
), document.getElementById('app'))
