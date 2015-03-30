import 'style/app'

import App     from 'App'
import Layout  from 'components/Layout'
import React   from 'react'
import Router  from 'plugins/router'
import Storage from 'plugins/storage'

// Each app is a unique instance.
// It will get its own state, useful for having multiple apps on
// the same page or for independence between requests
let app = new App()

// Plugins run before an app starts. You can use them to bootstrap
// behavior

// Save to local stoage
app.addPlugin(Storage)

// Pushes route actions as they occur
app.addPlugin(Router)

app.start(function() {
  React.render(<Layout flux={ app } />, document.getElementById('app'))
})
