import React from 'react'
import Router, { Route, DefaultRoute } from 'react-router'

export default (
  <Route name="home" path="/react-router" handler={ require('./layout') }>
    <DefaultRoute handler={ require('./index') } />
    <Route name="list" path=":id" handler={ require('./show') } />
  </Route>
)
