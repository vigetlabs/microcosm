import React from 'react'
import {Route, IndexRoute} from 'react-router'

import ListIndex from './components/lists/index'
import NotFound  from './components/notfound'
import ListShow  from './components/lists/show'

export default (
  <Route name="home" path="/" ref="routes">
    <IndexRoute component={ ListIndex } />
    <Route path="/lists/:id" component={ ListShow } />
    <Route path="*" component={ NotFound } />
  </Route>
)
