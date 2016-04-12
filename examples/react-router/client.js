import Hydrate from './app/plugins/hydrate'
import Render  from './app/plugins/render'
import Todos   from './app/todos'

// Each app is a unique instance.
// It will get its own state, useful for having multiple apps on
// the same page or for independence between requests
let app = new Todos()

// Pick up state where the server left off
Hydrate(app, 'REACT_ROUTER_SEED')

// Render changes to the screen
Render(app, document.getElementById('app'))
