import React     from 'react'
import DOM       from 'react-dom'
import Provider  from '../../../src/addons/provider'
import Debugger  from 'microcosm-debugger'
import Todos     from './todos'
import routes    from './routes'

import { Router, browserHistory } from 'react-router'

const repo = new Todos({ maxHistory: Infinity })

// Install the debugger
Debugger(repo)

// Render
DOM.render((
  <Provider repo={ repo }>
    <Router history={ browserHistory } routes={ routes } />
  </Provider>
), document.getElementById('app'))
