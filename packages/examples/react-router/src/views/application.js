import React from 'react'
import Switch from 'react-router/Switch'
import Route from 'react-router/Route'
import ListIndex from './lists/index'
import ListShow from './lists/show'
import NotFound from './errors/notfound'
import { Presenter } from 'microcosm-dom'

class Application extends Presenter {
  render() {
    return (
      <Switch>
        <Route path="/" exact component={ListIndex} />
        <Route path="/lists/:id" component={ListShow} />
        <Route component={NotFound} />
      </Switch>
    )
  }
}

export default Application
