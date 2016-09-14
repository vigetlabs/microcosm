# React Router Integration

For most applications that utilize React Router, having access to
Microcosm is essential for dispatching actions as route handlers enter
the stage.

The `Presenter` addon can be used to "frame" an app with a given
Microcosm in context:

```javascript
import React     from 'react'
import DOM       from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import Microcosm from 'microcosm'
import routes    from './routes'

import { Router, browserHistory } from 'react-router'

const repo = new Microcosm()

DOM.render((
  <Presenter repo={ repo }>
    <Router history={ browserHistory } routes={ routes } />
  </Presenter>
), document.getElementById('entry-point'))
```

`Presenter` accepts an instance of Microcosm, exposing it via
`context`. From there, other presenters can lean on that context to
add specific data subscriptions:

```javascript
import Presenter from 'microcosm/addons/presenter'

class Planets extends Presenter {
  viewModel() {
    return {
      planets: state => state.planets
    }
  }

  render() {
    return (
      <ul>
        { this.state.planets.map(planet => (<li>{ planet.name }</li>)) }
      </ul>
    )
  }
}
```
