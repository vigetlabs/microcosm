import Todos   from './app/todos'
import Storage from './app/plugins/storage'
import Render  from './app/plugins/render'

// Each app is a unique instance.
// It will get its own state, useful for having multiple apps on
// the same page or for independence between requests
let app = new Todos()

// Plugins run before an app starts. You can use them to bootstrap
// behavior.

// Save to local storage
app.addPlugin(Storage)

// Render changes to the screen
app.addPlugin(Render, {
  el: document.getElementById('app')
})

// Starting the application will run through all plugins
app.start()
