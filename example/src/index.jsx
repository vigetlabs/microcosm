import 'style/app'

import App     from './App'
import Router  from './services/router'
import Route   from './actions/route'
import Layout  from 'components/Layout'
import React   from 'react'

let flux = new App()
let el   = document.getElementById('app')

// Services
Router.install(flux, Route.set)

requestAnimationFrame(function() {
  React.render(<Layout flux={ flux } />, document.getElementById('app'))
})
