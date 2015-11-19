import React from 'react'
import { Route, IndexRoute } from 'react-router'

import Index    from './index'
import Layout   from './layout'
import NotFound from './notfound'
import Show     from './show'

export default (
  <Route name="home" path="/" component={ Layout }>
    <IndexRoute component={ Index } />
    <Route path="/lists/:id" component={ Show } />
    <Route path="*" component={ NotFound } />
  </Route>
)
