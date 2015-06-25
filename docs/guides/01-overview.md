# Microcosm at a glance

Microcosm began as a way to organize complicated React component libraries. State isolation and simplicity are primary concerns in this environment; they frame many of the decisions within the framework:

1. Central, isolated state
2. Easy data serialization
3. Small, extendable API

This document is largely exploratory. We will touch on all the key areas, but it won't take long.

**Heads up!** Microcosm heavily embraces ES6 JavaScript. For those
unfamiliar with newer JavaScript concepts, check out the fantastic
documentation about these new additions and how to bring them to your
project over at [BabelJS](http://babeljs.io).

## Building a Microcosm

A Microcosm provides a central place to keep information. Although you can instantiate one directly, extending it using the ES6 class keyword provides a way to keep configuration logic in one place.

```javascript
import Microcosm from 'microcosm'

class SolarSystem extends Microcosm {
	constructor() {
		super()
		// More will go here
	}
}

let app = new SolarSystem()

app.start(function() {
	console.log('Hello, Microcosm.')
})
```

`SolarSystem` will own all application state. It keeps this in a central object that can be accessed from `app.state`. In order to operate on state, however, Microcosm delegates data transformation to Stores.

## Stores - Kind manipulators of state

A store is a JavaScript configuration object that teaches Microcosm how to operate on data. A store manages a particular key of the data object managed by a Microcosm instance. Whenever an action is sent into Microcosm, it will delegate to stores to determine how to respond to it and ultimately transform into the next state.

One of those configuration settings of Stores is `getInitialState`, which tells the Microcosm what value the store will start with:

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

let app = new SolarSystem()

app.start(function() {
	console.log(app.state.planets) // Empty!
})
```

In the code above, we have told the `SolarSystem` that the `Planets` store will manage data under the `'planets'` key. However, at the moment, `Planets` is not configured to respond to actions sent into `SolarSystem`.

## Actions - The language of the system

Actions provide an identity to the types of events that trigger changes to application state. In Microcosm, they are basic functions that return values - that's it.

Of course, there's a bit more to it than that. Actions can return more than primitive values. If you return Promise, Microcosm will wait for it to resolve. Actions can even be ES6 generators if you wish to progressively operate within the same space (more on this in future guides).

The important thing about actions is that they represent an account of things that have happened. Microcosm reduces an action into a primitive value, communicates that result to stores for processing:

```javascript
import Microcosm from 'microcosm'

function addPlanet(options) {
  // Here, we are simply returning options. However this
  // gives you an opportunity to modify parameters before they
  // are sent to stores.
  //
	// More options for Actions can be found in docs/api/actions.md
  return options
}

let Planets = {
  getInitialState() {
    return []
  },
  register() {
    return {
      [addPlanet] : this.add
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

let app = new SolarSystem()

app.start(function() {
	app.push(Actions.addPlanet, { name: 'Earth' })
	console.log(app.state.planets) // [{ name: 'Earth' }]
})
```

When the `SolarSystem` sees `addPlanet` was pushed, it will call it within the context of the individual app and send the result of it to the `Planets` store. In the `register` function of `Planets`, we've defined that it should forward `addPlanet` to `Planets.add`. `Planets.add` is then responsible for returning a new list of planets based upon the previous value and the parameters it was sent from the action.

## Wrapping up

As it pertains to the Microcosm lifecycle, we've just about come full circle. Future guides will dig deeper into the specifics of each step and provide guidance when using Microcosm in unison with React.
