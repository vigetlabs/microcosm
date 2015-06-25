# Stores

Stores take data and transform it into a new state. They do not
provide any storage of their own. In practice, stores are a collection of functions stitched together by a `register` method that establishes a communication medium with a Microcosm.

## Getting initial state

Whenever a Microcosm calls `start()` it will ask its registered stores what the starting value of their particular managed keys should be.

```javascript
var Planets = {
  getInitialState() {
    return []
  }
}

app.addStore('planets', Planet)

app.start()
```

In the case above, the `planets` key of `app` will be assigned to an empty array whenever the app starts. Under the hood Microcosm is using the `reset` method, which asks all stores to run `getInitialState` and reduces it into a new state.

## Exporting data

Stores have the opportunity transform data before it is serialized into JSON. This occurs when either `serialize` or `toJSON` are envoked, or when `JSON.stringify` is called upon a Microcosm.

For example, if using
[ImmutableJS](https://github.com/facebook/immutable-js), this might
look like:

```javascript
var Planets = {
  getInitialState() {
    return Immutable.List()
  },
  serialize(planets) {
    return planets.toJSON()
  }
}
```

## Importing data

Data can be injected into a Microcosm using `app.replace`. When this occurs, `deserialize` will be called on all Stores to allow data to be processed before it enters the application:

```javascript
var Planets = {
  getInitialState() {
    return Immutable.List()
  },
  serialize(planets) {
    return planets.toJSON()
  },
  deserialize(raw) {
    return Immutable.List(raw)
  }
}
```

## Responding to actions

`register` is called whenever an action is dispatched to a store. It informs a Microcosm on what actions it can perform to modify state:

```javascript
function addPlanet(data) {
	return data
}

var Planets = {
	getInitialState() {
		return []
	},
  register() {
    return {
      [add]: this.add
    }
  },
  add(planets, params) {
    return planets.concat(params)
  }
}

app.push(addPlanet, { name: 'earth' }) // this will add Earth
```

In the example above, the returned object from `register` implements the stringified version of `addPlanet` (actions stringify to unique keys, handled for you by Microcosm). In this case, the parameters sent from the action are appended to the end of the list of known planets.

If a store can not respond to an action, it returns the original state. No modification occurs.
