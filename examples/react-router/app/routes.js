import React from 'react'
import { Route, IndexRoute } from 'react-router'

import ListIndex from './presenters/list-index'
import ListShow from './presenters/list-show'
import NotFound from './views/notfound'

export default (
  <Route name="home" path="/">
    <IndexRoute component={ListIndex} />
    <Route path="lists/:id" component={ListShow} />
    <Route path="*" component={NotFound} />
  </Route>
)
