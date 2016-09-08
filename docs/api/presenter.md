# Presenter

1. [Overview](#overview)
2. [Computed Properties](#computed-properties)
3. [Receiving Intents](#receiving-intents)
4. [API](#api)

## Overview

When working on larger applications, we observed substantial benefits
from creating a separation between "passive view" React components,
and those that interacted directly with Microcosm (and other
non-presentational entities).

The Presenter add-on makes it easier to keep application logic high
within a component tree. It is designed specifically to extract and
compute properties coming from a Microcosm instance and efficiently
send them down as `props` to child "passive view" React components.

Additionally Presenters may implement `intents`, allowing view
components lower in the component tree to broadcast a message to be
caught and handled by Presenters.

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

repo.replace({ planets: [ 'Mercury', 'Venus', 'Earth' ]})

class PlanetsPresenter extends Presenter {

  viewModel(props) {
    return {
      planets: state => state.planets
    }
  }

  render() {
    return <p>{ this.state.planets.join(', ') }</p>
  }

}

DOM.render(<PlanetsPresenter repo={ repo } />)
```

In the example above, the `PlanetsPresenter` will extract a list of
planets from the Microcosm instance provided to it via the `repo`
prop. This is available as state, which the Presenter can send into a
child component.

## Receiving Intents

Though explicit, passing event callbacks down through a deep component
hierarchy can be cumbersome and brittle. Presenters expose a method on
`context` that enable child components to declare `intents` receivable
by Presenters.

The Form add-on can be used to broadcast intents to Presenters:


```javascript
import React from 'react'
import DOM from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import Form from 'microcosm/addons/form'
import Microcosm from 'microcosm'

const repo = new Microcosm()

const increaseCount = n => n

repo.addStore('count', {
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
    <Form intent="increaseCount">
      <input type="hidden" name="amount" value="1" />
      <p>The current count is { count }</p>
      <button>+ 1</button>
    </Form>
  )
}

class CountPresenter extends Presenter {
  viewModel() {
    return {
      count: state => state.count
    }
  }

  register() {
    return {
      increaseCount: this.increaseCount
    }
  }

  increaseCount(repo, { amount }) {
    return repo.push(increment, amount)
  }

  render() {
    return <StepperForm count={ this.state.count } />
  }
}

DOM.render(<CountPresenter repo={ repo } />, document.getElementById('container'))
```

Whenever the form is submitted, an `increaseCount` intent will bubble
up to the associated Presenter including the serialized parameters of
the form. Since this Presenter's register method includes `increaseCount`, it will
invoke the method with the associated parameters.

If a Presenter does not implement an intent, it will bubble up to any
parent Presenters. If no Presenter implements the intent, an exception
will raise.

## API

### `presenterWillMount(repo, props)`

Similar to componentWillMount. Called before the presenter mounts.

### `presenterDidMount(repo, props)`

Similar to componentDidMount. Called when a presenter mounts.

### `presenterWillReceiveProps(repo, props)`

Similar to componentWillReceiveProps. Called when a presenter receives new props.

### `presenterWillUpdate(repo, props)`

Similar to componentWillUpdate. Called when a presenter is about to update.

### `presenterDidUpdate(repo, props)`

Similar to componentDidUpdate. Called when a presenter updates.

### `viewModel(props)`

Builds a view model for the current props. This must return an object of key/value
pairs. If the value is a function, it will be calculated by passing in the repo's
current state:

```javascript
class PlanetPresenter extends Presenter {
  viewModel(props) {
    return {
      planet : state => state.planets.find(p => p.id === props.planetId)
    }
  }
  // ...
}
```

If the Presenter is pure (passed in as either a prop or as an option to the
associated repo), this will only update state if shallowly equal.

### register()

Expose "intent" subscriptions to child components. This is used with the <Form />
add-on to improve the ergonomics of presenter/view communication (though this only
occurs from the view to the presenter).

```javascript
import Form from 'microcosm/addons/form'

class HelloWorldPresenter extends Presenter {
  register() {
    return {
      'greet': this.greet
    }
  }
  greet() {
    alert("hello world!")
  }
  render() {
    return (
      <Form intent="greet">
        <button>Greet</button>
      </Form>
    )
  }
}
```
