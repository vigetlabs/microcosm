# Presenter

1. [Overview](#overview)
2. [Track changes and compute values](#track-changes-and-compute-values)
3. [Receiving Actions](#receiving-actions)
4. [API](#api)

## Overview

Presenter is a specialized React component that creates a boundary
between "smart" and "dumb" components. This improves testing and keeps
business logic in a consistent place (instead of spread across bunches
of components).

Use Presenters to track changes to a Microcosm, push actions, and
manage application flow.

## Track changes and compute values

Presenter extends from `React.Component` and can be used exactly the
same way. By implementing a `getModel` method, Presenters declare what
information they need from an instance of Microcosm:

```javascript
import React from 'react'
import DOM from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import Microcosm from 'microcosm'

const repo = new Microcosm()

repo.patch({ planets: [ 'Mercury', 'Venus', 'Earth' ]})

class PlanetsPresenter extends Presenter {

  getModel (props, state) {
    return {
      planets: data => data.planets
    }
  }

  render () {
    const { planets } = this.model

    return <p>{planets.join(', ')}</p>
  }

}

DOM.render(<PlanetsPresenter repo={ repo } />)

// <p>Mercury, Venus, Earth</p>
```

Presenters accept a `repo` property; an instance of
Microcosm. Here, `PlanetsPresenter` extracts a list of planets its given
Microcosm and stores it within `this.model`.

Presenters track their Microcosm instance for changes, keeping
`this.model` in sync.

## Receiving Actions

Though explicit, passing event callbacks down through a deep component
hierarchy can be cumbersome and brittle. Presenters expose a method on
`context` that enable child components to declare `actions` receivable
by Presenters.

The [ActionForm](./action-form.md) add-on can be used to broadcast
actions to Presenters:

```javascript
import React from 'react'
import DOM from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import ActionForm from 'microcosm/addons/action-form'
import Microcosm from 'microcosm'

const repo = new Microcosm()

const increaseCount = n => n

repo.addDomain('count', {
  getInitialState() {
    return 0
  },
  increase(count, amount) {
    return count + amount
  },
  intercept() {
    return {
      [increaseCount] : this.increase
    }
  }
})

function StepperForm ({ count }) {
  return (
    <ActionForm action="increment">
      <input type="hidden" name="amount" value="1" />
      <p>The current count is { count }</p>
      <button>+ 1</button>
    </ActionForm>
  )
}

class CountPresenter extends Presenter {
  getModel () {
    return {
      count: data => data.count
    }
  }

  intercept () {
    return {
      "increment": this.increaseCount
    }
  }

  increaseCount (repo, { amount }) {
    return repo.push(increaseCount, amount)
  }

  render () {
    const { count } = this.model

    return <StepperForm count={count} />
  }
}

DOM.render(<CountPresenter repo={ repo } />, document.getElementById('container'))
```

Whenever the form is submitted, an `increaseCount` action will bubble
up to the associated Presenter including the serialized parameters of
the form. Since this Presenter's intercept method includes
`increaseCount`, it will invoke the method with the associated
parameters.

If a Presenter does not intercept an action, it will bubble up to any
parent Presenters. If no Presenter intercepts the action, it will
dispatch the action to the repo.

```javascript
function StepperForm ({ count }) {
  return (
    <Form action={ increaseCount }>
      <input type="hidden" name="amount" value="1" />
      <p>The current count is { count }</p>
      <button>+ 1</button>
    </Form>
  )
}
```

## API

### `setup(repo, props, state)`

Called when a presenter is created, useful any prep work. `setup` runs
before the first `getModel` invocation.

```javascript
import { getPlanets } from '../actions/planets'

class PlanetsList extends Presenter {
  setup (repo, props, state) {
    // Important: this.model is not defined yet!
    repo.push(getPlanets)
  }
  // ...
}
```

### `ready(repo, props, state)`

Called after the presenter has run `setup` and executed the first
`getModel`. This hook is useful for fetching initial data and other
start tasks that need access to the model data.

```javascript
import { getPlanets } from '../actions/planets'

class PlanetsList extends Presenter {
  getModel () {
    return {
      planets: state => state.planets
    }
  }
  ready (repo, props, state) {
    if (this.model.planets.length <=0) {
      repo.push(getPlanets)
    }
  }
  // ...
}
```

### `update(repo, nextProps, nextState)`

Called when a presenter _gets new props_. This is useful for secondary
data fetching and other work that must happen when a Presenter receives
new information.

```javascript
import { getPlanet } from '../actions/planets'

class Planet extends Presenter {
  getModel (props) {
    const { planetId } = props

    return {
      planet: state => state.planets.find(planet => planet.id === planetId)
    }
  }
  update (repo, nextProps, nextState) {
    if (nextProps.planetId !== this.props.planetId)
      repo.push(getPlanet, nextProps.planetId)
    }
  }
  // ...
}
```

In order for this hook to be useful, we ensure that `update` is executed only after the latest model has been calculated.

**NOTE:** `update` is not necessarily always called when the model changes! It only gets called when the `props` sent to Presenter change or when `state` changes within the Presenter.

### `teardown(repo, props, state)`

Runs when the presenter unmounts. Useful for tearing down
subscriptions and other setup behavior.

```javascript
class Example extends Presenter {
  setup () {
    this.socket = new WebSocket('ws://localhost:3000')
  }
  teardown () {
    this.socket.close()
  }
}
```

### `getModel(props, state)`

Builds a view model for the current props and state. This must return
an object of key/value pairs.

```javascript
class PlanetPresenter extends Presenter {
  getModel (props, state) {
    return {
      planet : data => data.planets.find(p => p.id === props.planetId)
    }
  }
  // ...
}
```

`getModel` assigns a `model` property to the presenter, similarly to `props` or
`state`. It is recalculated whenever the Presenter's `props` or `state`
changes, and functions returned from model keys are invoked every time the repo
changes.

### `view`

If a Presenter has a `view` property, it creates the associated component
instead of calling `render`. The `view` component is given the latest model
data:

```javascript
function Message ({ message }) {
  return <p>{message}</p>
}

class Greeter extends Presenter {
  view = Message

  getModel ({ greet })
    return {
      message: "Hello, " + greet
    }
  }
}
```

Views may also be assigned as a getter:

```javascript
class ShowPlanet extends Presenter {
  getModel (props) {
    return {
      planet: state => state.planets.find(p => p.id === props.id)
    }
  }
  get view {
    return this.model.planet ? PlanetView : MissingView
  }
}
```

Views are passed the `send` method on a Presenter. This provides the
exact same behavior as `withSend`:

```javascript
function Button ({ send }) {
  return <button onClick={() => send('test')}>Click me!</button>
}

class Example extends Presenter {
  view = Button

  intercept () {
    return {
      'test': () => alert("This is a test!")
    }
  }
}
```

### `intercept()`

Catch an action emitted from a child view, using an add-on `ActionForm`,
`ActionButton`, or `withSend`. These add-ons are designed to improve the
ergonomics of presenter/view communication. Data down, actions up.

```javascript
import ActionForm from 'microcosm/addons/action-form'

class HelloWorldPresenter extends Presenter {
  intercept () {
    return {
      'greet': this.greet
    }
  }
  greet (repo, data) {
    alert("hello world!")
  }
  render () {
    return (
      <ActionForm action="greet">
        <button>Greet</button>
      </ActionForm>
    )
  }
}
```

### `getRepo(repo, props)`

Runs before assigning a repo to a Presenter. This method is given the
parent repo, either passed in via `props` or `context`. By default, it
returns a fork of that repo, or a new Microcosm if no repo is
provided.

This provides an opportunity to customize the repo behavior for a
particular Presenter. For example, to circumvent the default Presenter
forking behavior:

```javascript
class NoFork extends Presenter {
  getRepo (repo) {
    return repo
  }
}
```

### `send(action, ...params)`

Bubble an action up through the presenter tree. If no parent presenter
responds to the action within their `intercept()` method, then
dispatch it to the root Microcosm repo.

This works exactly like the `send` property passed into a component
that is wrapped in the `withSend` higher order component.

```javascript
function AlertButton ({ message, send }) {
  return (
    <button onClick={() => send('alert', message)}>
      Click Me
    </button>
  )
}

class Example extends Presenter {
  intercept () {
    return {
      alert: message => alert(message)
    }
  }

  render () {
    return <AlertButton message="Hey!" send={this.send} />
  }
}
```
