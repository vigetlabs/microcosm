# Architecture

In this guide, we'll walk through how Microcosm apps are organized, and how
all of the pieces work together.

## Model-View-Presenter

We recommend following the [Model-View-Presenter (MVP)](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter)
pattern. This influences the project folder structure:

```bash
src/
├── actions
├── domains
├── effects
├── presenters
├── views
├── repo.js
├── index.js
└── routes.js
```

## Routing

Whenever the application boots, Microcosm apps use a router such as
[React Router](https://github.com/reactjs/react-router)
or [CherryTree](https://github.com/KidkArolis/cherrytree-for-react)
to determine where a user has entered into the application.

This yields a list of high responsibility route handler components (Presenters),
resulting in a nested structure similar to a [Russian doll](https://www.google.com/search?q=russian+doll&espv=2&biw=1440&bih=799&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiOnOCd08nQAhVLKiYKHZSRAU8Q_AUIBigB#tbm=isch&q=russian+doll&chips=q:russian+doll,g_1:traditional):

```bash
url: http://my-planets-site.dev/planets/1

+--------- [App] ----------+
| +----- [Planets] ------+ |
| | +-----+ +--[Show]--+ | |
| | |     | |          | | |
| | |     | |          | | |
| | +-----+ +----------+ | |
| +----------------------+ |
+--------------------------+
```

This URL might map to the following:

1.  **Application wide layout.** Global navigation, system wide notifications.
2.  **Planets section layout.** UI specific to the Planets section,
    like a sidebar of all planets.
3.  **Planet specific layout.** A card with specific stats about a planet.

Each Presenter is given the application's instance of Microcosm. We
call it the `repo`. Since Presenters extend from `React.Component`,
they receive nested routes as children (renderable by their view).

## Presenters

Presenters are high-level UI components that form a wall between the data layer
and the vast majority of the presentation layer. Presenters build a view model
by extracting information from the data layer, sending that into "passive views".

```javascript
class PlanetsIndex extends Presenter {
  view = PlanetsList

  model() {
    return {
      planets: state => state.planets
    }
  }
}
```

Additionally, each Presenter receives a "fork" of their Microcosm instance.
This fork receives data updates from its parent, however can add additional
domains or effects for specific use cases. This allows Microcosm applications
to be broken up into logical chunks.

```javascript
class PlanetsIndex extends Presenter {
  setup(repo) {
    repo.addDomain('special', UseCase)
  }
  //...
}
```

## Views

Presenters maintain a strong separation between the data layer and the
presentation layer. Views should know as little about the application as
possible. This makes them easy to reason about, test, and reuse.

At their simplest, Views are just React components:

```javascript
function PlanetsList({ planets = [] }) {
  if (planets.length <= 0) {
    return <p>No Planets</p>
  }

  return <ul>{planets.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}
```

However they can also communicate user actions back to the application using
_Actions_.

### Actions

Actions provide a way for views to report on user behavior in a way that does
not couple them to specific implementation details within a Presenter. A View
can simply broadcast that something has happened, allowing a Presenter (or a
test) to pick on on that behavior.

By wrapping a View with the `withSend` add-on, Views receive a `send` prop
that allows them to broadcast Actions.

```javascript
import React from 'react'
import withSend from 'microcosm/addons/with-send'

export default withSend(function DeleteButton({ send, id }) {
  return <button onClick={() => send('delete', id)}>Delete</button>
})
```

By implementing an `intercept` method, a Presenter can subscribe to
these actions, adding intermediary processing or just push an action:

```javascript
class PlanetsShow extends Presenter {
  intercept() {
    return {
      delete: (repo, id) => repo.push(deletePlanet, id)
    }
  }
}
```

Or, Actions can also take the form of Actions:

```javascript
import React from 'react'
import withSend from 'microcosm/addons/with-send'
import { deletePlanet } from 'actions/planets'

export default withSend(function DeleteButton({ send, id }) {
  return <button onClick={() => send(deletePlanet, id)}>Delete</button>
})
```

In this case, there's no need for the Presenter to intercept the event,
and it will just get passed along to the Repo.

## Actions

The message format for the application. In the context of Microcosm, an action
contains information on the state of its progress as well as any associated
data.

```javascript
// axios is an AJAX library
// https://github.com/mzabriskie/axios
import axios from 'axios'

function createPlanet(body) {
  // axios returns a Promise, handled out of the box
  return axios.post('/planets', body)
}
```

## Domains

Whenever an Action is pushed into a repo (the project's instance of Microcosm),
it leans on Domains to transform data.

Domains are assigned to a specified key in a Microcosm instance, subscribing to
specific action states (`done`, `error`, `cancelled`...). As actions are pushed
into a Microcosm, Domains are ultimately responsible for how those actions turn
into data modifications useable by the presentation layer.

Domains implement a `register()` method to subscribe to actions:

```javascript
class Planets {
  getInitialState() {
    return []
  }
  append(planets, body) {
    return planets.concat(body)
  }
  register() {
    return {
      [createPlanet]: this.append
    }
  }
}
```

Presenters actively listen to state changes in their repo. As they receive updates,
they pass them down into the view layer to update the UI.

## Effects

**Domains must be free of side-effects.** Microcosm may call a domain handler
multiple times when resolving multiple asynchronous actions. This is inconvenient
for one-time side-effects, or behavior that doesn't relate to data operaitons.

Effects provide a way to formally declare side-effects in a way that is easy to
track, setup and teardown.

```javascript
class Logger {
  trackError(repo, error) {
    console.error('Failed to create planet', error)
  }
  register() {
    return {
      [createPlanet.error]: this.trackError
    }
  }
}
```

## Quick Recap

Data flows downward, transformed by presenters into a form useful to the view layer.
As users interact with the app, actions are dispatched to domains and effects
to handle necessary state changes and side-effects.
