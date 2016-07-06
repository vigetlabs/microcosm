import React     from 'react'
import DOM       from 'react-dom'
import Provider  from 'microcosm/addons/provider'
import Debugger  from 'microcosm-debugger'
import Microcosm from 'microcosm'
import Items     from './stores/items'
import Lists     from './stores/lists'
import routes    from './routes'

import { Router, browserHistory } from 'react-router'

const app = new Microcosm({ maxHistory: Infinity })

// 1. Lists
app.addStore('lists', Lists)

// 2. List Items
app.addStore('items', Items)

// 3. Install the debugger
Debugger(app)

// 4. Render
DOM.render((
  <Provider app={ app }>
    <Router history={ browserHistory } routes={ routes } />
  </Provider>
), document.getElementById('app'))
