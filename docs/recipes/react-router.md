# React Router Integration

For more applications that utilize React Router, having access to
Microcosm is essential for dispatching actions as route handlers enter
the stage. One way of handling this is to expose Microcosm within
`context`. The `Provider` addon does just that:

```javascript
import React     from 'react'
import DOM       from 'react-dom'
import Provider  from 'microcosm/addons/provider'
import Microcosm from 'microcosm'
import routes    from './routes'

import { Router, browserHistory } from 'react-router'

const app = new Microcosm()

DOM.render((
  <Provider app={ app }>
    <Router history={ browserHistory } routes={ routes } />
  </Provider>
), document.getElementById('entry-point'))
```

`Provider` accepts an instance of Microcosm, exposing it via
`context`. The `Connect` addon maybe used to retrieve this instance:

```javascript
import Connect from 'microcosm/addons/connect'

const connection = Connect(function (props) {
  return {
    planets: state => state.planets
  }
})

const Planets = connection(function ({ app, planets }) {
  return (
    <ul>
      { planets.map(planet => (<li>{ planet.name }</li>)) }
    </ul>
  )
})
```
