# React Router Integration

For most applications that utilize React Router, having access to
Microcosm is essential for dispatching actions as route handlers enter
the stage.

We recommend mounting a "root" `Presenter`, framing context such that
child presenters have access to a central Microcosm repo:

```javascript
import React from 'react'
import DOM from 'react-dom'
import { Router } from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import { AppContainer } from 'react-hot-loader'
import Application from './views/layout'

const repo = new Microocsm()

DOM.render(
  <Router>
    <Application repo={repo} />
  </Router>,
  document.getElementById('app')
)
```

Drawing from the example above, `Application` may look something like:

```javascript
import React from 'react'
import Switch from 'react-router/Switch'
import Route from 'react-router/Route'
import Presenter from 'microcosm/addons/presenter'

class Application extends Presenter {
  render() {
    return <Switch>{/* routes */}</Switch>
  }
}

export default Application
```

For more information, see the [React Router example app](https://github.com/vigetlabs/microcosm/tree/master/examples/react-router).
