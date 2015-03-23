import 'style/app'

import App     from 'App'
import Layout  from 'components/Layout'
import React   from 'react'
import Router  from 'services/router'
import Storage from 'services/storage'

// Each app is a unique instance.
// It will get its own state, useful for having multiple apps on
// the same page or for independence between requests
let app = new App()

// Services are basically just listeners
// that operate on an app instance

// On change, this will save to local stoage
Storage.install(app)

// Pushes route actions as they occur
Router.install(app)

React.render(<Layout flux={ app } />, document.getElementById('app'))
