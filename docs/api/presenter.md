# Presenter

1. [Overview](#overview)
2. [Computed Properties](#computed-properties)
3. [Receiving Actions](#receiving-actions)
4. [API](#api)

## Overview

The Presenter add-on makes it easier to keep application logic high
within a component tree. It is designed specifically to extract and
compute properties coming from a Microcosm instance and efficiently
send them down as `props` to child "passive view" React components.

Presenters also make it easy for components deep within a component
tree to communicate without passing a long chain of props. The
`withAction` and `<Form />` may be used to broadcast messages called
"actions" to parent Presenter components, or straight to a Microcosm
repo itself if no Presenter intercepts the message.

We'll cover both of these features within this document

## Computed Properties

Presenter extends from `React.Component`, and can be used just like a
React component:

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
```

In the example above, the `PlanetsPresenter` will extract a list of
planets from the Microcosm instance provided to it via the `repo`
prop. This is available as state, which the Presenter can send into a
child component.

## Receiving Actions

Though explicit, passing event callbacks down through a deep component
hierarchy can be cumbersome and brittle. Presenters expose a method on
`context` that enable child components to declare `actions` receivable
by Presenters.

The Form add-on can be used to broadcast actions to Presenters:

```javascript
import React from 'react'
import DOM from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import Form from 'microcosm/addons/form'
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
  register() {
    return {
      [increaseCount] : this.increase
    }
  }
})

function StepperForm ({ count }) {
  return (
    <Form action="increaseCount">
      <input type="hidden" name="amount" value="1" />
      <p>The current count is { count }</p>
      <button>+ 1</button>
    </Form>
  )
}

class CountPresenter extends Presenter {
  getModel () {
    return {
      count: data => data.count
    }
  }

  register () {
    return {
      increaseCount: this.increaseCount
    }
  }

  increaseCount (repo, { amount }) {
    return repo.push(increment, amount)
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
the form. Since this Presenter's register method includes `increaseCount`, it will
invoke the method with the associated parameters.

If a Presenter does not implement an action, it will bubble up to any
parent Presenters. If no Presenter implements the action, an exception
will raise. This is useful for broadcasting action actions. For
example, we could replace the prior Form example with:

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

Called when a presenter is created, useful any prep work. `setup` runs before the first `getModel` invocation.

### `ready(repo, props, state)`

Called after the presenter has run `setup` and executed the first `getModel`. This hook is useful for fetching initial data and other start tasks that need access to the model data.

### `update(repo, props, state)`

Called when a presenter gets new props. This is useful for secondary
data fetching and other work that must happen when a Presenter receives
new information.

`update` is always executed after the latest model has been calculated.

### `teardown(repo, props, state)`

Runs when the presenter unmounts. Useful for tearing down subscriptions and other setup behavior.

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

If a Presenter has a `view` property, it create the associated component instead of calling `render`. The `view` component is given the latest model data:

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
exact same behavior as `withAction`:

```javascript
function Button ({ send }) {
  return <button onClick={() => send('test')}>Click me!</button>
}

class Example extends Presenter {
  view = Button

  register () {
    return {
      'test': () => alert("This is a test!")
    }
  }
}
```

### register()

Expose "action" subscriptions to child components. This is used with the `Form` or `withAction`
add-ons to improve the ergonomics of presenter/view communication (though this only
occurs from the view to the presenter).

```javascript
import Form from 'microcosm/addons/form'

class HelloWorldPresenter extends Presenter {
  register () {
    return {
      'greet': this.greet
    }
  }
  greet () {
    alert("hello world!")
  }
  render () {
    return (
      <Form action="greet">
        <button>Greet</button>
      </Form>
    )
  }
}
```

### getRepo(repo, props)

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
