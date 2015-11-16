import Todos   from './app/todos'
import Hydrate from './app/plugins/hydrate'
import Render  from './app/plugins/render'

// Each app is a unique instance.
// It will get its own state, useful for having multiple apps on
// the same page or for independence between requests
let app = new Todos()

// Plugins run before an app starts. You can use them to bootstrap
// behavior.

// Pick up state where the server left off
app.addPlugin(Hydrate, 'REACT_ROUTER_SEED')

// Render changes to the screen
app.addPlugin(Render, document.getElementById('app'))

// Starting the application will run through all plugins
app.start(function(error) {
  if (error) {
    throw error
  }

  console.log('ReactRouter example is ready!')
})
