import React from 'react'
import Router, { Route, DefaultRoute } from 'react-router'

export let routes = (
  <Route name="home" path="/" handler={ require('./components/layout') }>
    <DefaultRoute handler={ require('./components/index') } />

    <Route name="list" path="/:id" handler={ require('./components/show') } />
  </Route>
)

export default Router.create({ routes })
