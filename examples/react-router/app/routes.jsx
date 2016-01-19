import React from 'react'
import { Route, IndexRoute } from 'react-router'

import Index    from './components/index'
import Layout   from './components/layout'
import NotFound from './components/notfound'
import Show     from './components/show'

export default (
  <Route name="home" path="/" component={ Layout }>
    <IndexRoute component={ Index } />
    <Route path="/lists/:id" component={ Show } />
    <Route path="*" component={ NotFound } />
  </Route>
)
