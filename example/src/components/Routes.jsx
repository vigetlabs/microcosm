import React from 'react'
import { DefaultRoute, Route, NotFoundRoute } from 'react-router'

export default (
  <Route path="/" name="home" handler={ require('Layout') }>
    <DefaultRoute handler={ require('layouts/Home') } />

    <Route path="list/:id" name="list" handler={ require('layouts/Show') } />
  </Route>
)
