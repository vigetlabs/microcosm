# Microcosm at a glance

Microcosm is a variant of [Flux](https://facebook.github.io/flux/) that controls and modifies state in a pure, centralized way.

Stores and action creators are collections of pure functions; they have no data of their own. They tell a Microcosm how it should transform itself from one state to the next.

This design seeks to achieve a reasonable trade off between the simplicity of singletons and the privacy of class instances.

In this guide, we'll explore some of these concepts through a basic Microcosm implementation.

## Constructing a Microcosm

A Microcosm provides a central place to keep information. Although you can instantiate one directly, extending it using the ES6 `class` keyword provides a way to keep configuration logic in one place.

```javascript
import Microcosm from 'microcosm'

class SolarSystem extends Microcosm {
	constructor() {
		super()
		// Configuration goes here.
		// Isolated from the outside world
	}
}

let app = new SolarSystem()

app.start(function() {
	console.log('Hello, Microcosm.')
})
```

Each `SolarSystem` instance will have its own state. In the example above, it can be accessed from `app.state` once it has started.

## Stores - Kind manipulators of state

A store is a JavaScript configuration object that teaches Microcosm how to operate on data. They operate on a single key, defined when it is registered:

```javascript
import Microcosm from 'microcosm'

let Planets = {}

class SolarSystem extends Microcosm {
  constructor() {
    super()
    // Planets will now teach SolarSystem
    // how to manage the 'plants' data
    this.addStore('planets', Planets)
  }
}

let app = new SolarSystem()

app.start(function() {
	console.log('Hello, Microcosm')
})
```

There are a couple of special method stores can implement to describe state at certain points in the Microcosm lifecycle. One of those methods is `getInitialState`, which tells the Microcosm what value the store will start with:

```javascript
import Microcosm from 'microcosm'

let Planets = {
  getInitialState() {
    return [{ name: 'Mercury' }]
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
	console.log(app.state.planets) // [{ name: 'Mercury' }]
})
```

Now a `SolarSystem` will always start with the planet Mercury.


## Action Creators - Signaling that state should change

Action creators (commonly shortened to "actions") provide an identity to the types of events that trigger changes to application state. Microcosm only expects that they are functions that return values.

Of course there is sophistication in _what_ they return. For example Microcosm will wait for Promises to resolve before doing anything with them. However this will be covered in a later guide specifically about actions.

The important thing about actions is that they represent an account something that has happened. Microcosm keeps a ledger of the output to perform discrete operations on state:

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
    return [{ name: 'Mercury' }]
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
	app.push(Actions.addPlanet, { name: 'Venus' })
	console.log(app.state.planets) // [{ name: 'Mercury' }, { name: 'Venus' }]
})
```

When the `SolarSystem` sees `addPlanet` was pushed, it will invoke it within the context of the individual app and send the result the `Planets` store.

The critical component in `Planets` is `register`: a function that returns a map associating actions with methods on the Store.

In this case, `addPlanet` maps directly to the `Planets.add` method. This works because Microcosm assigns a unique `toString()` method to each action, reduces down to a key in this map.

The result is that `addPlanet` will translate into an invocation of `Planet.add`, appending the provided information to the end of the `planets` list.

## Wrapping up

As it pertains to the Microcosm lifecycle, we've just about come full circle. The next guide moves into the specifics of stores. Check it out!

[Guide 2: Stores](./02-stores.md)
