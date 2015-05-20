# Hello, Microcosm

This tutorial will walk through creating a simple Flux application
with Microcosm. It will not go into usage with React, and is designed
to provide a high level overview of features.

**Heads up!** Microcosm heavily embraces ES6 JavaScript. For those
unfamiliar with newer JavaScript concepts, check out the fantastic
documentation about these new additions and how to bring them to your
project over at [BabelJS](http://babeljs.io).

## Getting started with Microcosm

A new app starts out as an extension of the `Microcosm` class:

```javascript
import Microcosm from 'microcosm'

class SolarSystem extends Microcosm {
  constructor() {
    super()
    // We'll put some stuff here later
  }
}
```

A Microcosm provides a central place to keep information. This
makes it easy to isolate state and simplify working with data. This is
particularly useful when doing server-side rendering, where it is
useful to isolate state between requests and send associated
application data down with pre-rendered HTML (`Microcosm::toJSON`).

In order to operate on that data, however, Microcosm delegates data
transformation to Stores.

A Store is simply a JavaScript configuration object that teaches a
Microcosm how to operate on data. A Store can respond to Actions sent
to a Microcosm, transforming data into the next state.

One of those configuration settings of Stores is `getInitialState`,
which tells the Microcosm what value the Store will first begin to
operate upon:

```javascript
import Microcosm from 'microcosm'

let Planets = {
  getInitialState() {
    return []
  }
}

class SolarSystem extends Microcosm {
  constructor() {
    super()
    this.addStore('planets', Planets)
  }
}
```

In the code above, we have told the `SolarSystem` to add `Planets`
store under the `'planets'` key. This means that the Store will be
used to transform value represented by `'planets'` in the `SolarSystem`'s
database.

In order to trigger that process, `Actions` are "pushed" into an
instance of Microcosm. An Action is a function that follows a
particular pattern. Microcosm will send the result of that function on
to Stores:

```javascript
import Microcosm from 'microcosm'

let Actions = {
  addPlanet(options) {
    // Here, we are simply returning options. However this
    // gives you an opportunity to modify parameters before they
    // are sent to stores.
    //
    // More options for Actions can be found in docs/api/actions.md
    return options
  }
}

let Planets = {
  getInitialState() {
    return []
  },
  register() {
    return {
      [Actions.addPlanet]: this.add
    }
  },
  add(planets, params) {
    return planets.concat(params)
  }
}

class SolarSystem extends Microcosm {
  constructor() {
    super()
    this.addStore('planets', Planets)
  }
}
```

When the `SolarSystem` triggers `Actions.addPlanet`, it will call that
function and send the result of it to the `Planets` store. In the
`register` function of `Planets`, we've defined that it should forward
`Actions.addPlanet` to `Planets.add`. `Planets.add` is then
responsible for returning a new list of planets based upon the
previous value and the parameters it was sent from the action.

## More on how Actions work

Actions are simply functions that generate information Stores need to
transform data.

```javascript
let Actions = {
  addPlanet(params) {
    return params
  }
}
```

Actions can take a couple of forms. In the case above, we simply take
`params` and return it back. There are more sophisticated ways to
build actions described in [`actions.md`](../actions.md).

Microcosms implement a `push` method. This will run execute a given
action with an arbitrary number of arguments (following the first).

This works like:

```javascript
app.push(Actions.addPlanet, { name: 'Saturn' })
```

This will command the app to trigger `Actions.addPlanet`, taking the
result of that function and forwarding it to all Stores. Stores
implement a `register` function that dictates whether or not they can
respond to that message.

## How Stores work

Stores are plain objects. They listen to actions by providing a
`register` method that hooks into Actions:

```javascript
let Planets = {
  getInitialState(seed) {
    return []
  },
  register() {
    return {
      [Actions.addPlanet]: this.add
    }
  },
  add(planets, props) {
    return planets.concat(props)
  }
}
```

Each store manages a subset of a global state object owned by an
individual Microcosm instance. By returning a new state object within
responses to actions, they modify state.

Microcosm will use `getInitialState` to produce the initial value for
the subset a store manages when an instance is started.

Unlike actions, stores must be registered with the system. There are
two reason for this. First: to tell Microcosm what Stores should be
responsible for managing state. Second: to dictate the priority of
dispatcher multicasting (similar to `waitFor` in the standard Flux
dispatcher)

### Getting the value out of a store

Microcosms implement a `get` method:

```javascript
app.get('planets')
```

This will pull the `'planets'` key out of global application state.

## Listening to changes

All Microcosm instances are simple event emitters. They emit a single change
event that you can subscribe to like:

```javascript
let app = new Microcosm()

// Add a callback
app.listen(callback)

// Remove a callback
app.ignore(callback)

// Force an emission
app.emit()
```

## Booting things up

`Microcosm::start` begins an application. This will setup initial
state and then execute a callback:

```javascript
let app = new Microcosm()

app.start(function() {
  // Now do something
})
```
