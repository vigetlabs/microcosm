# Stores

1. [Overview](#overview)
2. [API](#api)
3. [Installing Stores](#installing-stores)
4. [Listening to Actions](#listening-to-actions)
5. [Serializing State](#serializing-state)
6. [Deserializing State](#deserialize-state)

## Overview

Stores take data and transform it into a new state. They do not
provide any storage of their (although technically this isn't enforced
by Microcosm).

## API

### `getInitialState()`

Generate the starting value for the particular state this store is
managing. This will be called by the Microcosm using this store when
it is started.

```javascript
var Planets = {
  getInitialState() {
    return []
  }
}
```

### `serialize(state)`

Allows a store to transform data before it leaves the system. It gives
the store the opportunity to reduce non-primitive values into
JSON.

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

### `deserialize(state)`

Allows data to be transformed into a valid shape before it enters a
Microcosm. This is the reverse operation to `serialize`. Drawing from
the example in `serialize`:

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

### `register()`

Returns an object mapping actions to methods on the store. This is the
communication point between a store and the rest of the system.

```javascript
var Planets = {
  //...
  register() {
    return {
      [Action.add]: this.add
    }
  },
  add(planets, params) {
    return planets.concat(params)
  }
}

app.push(Actions.add, { name: 'earth' }) // this will add Earth
```

### `send(state, actions, params)`

Checks to see if the store can perform the given `action` using
`register()`. If the action is defined in the mapping returned by
`register()`, it will call the associated method with `state` and
`params`

This method isn't typically used directly, however it is open for
extension should you have opinions on how the store should be sent
messages.

## Installing Stores

Microcosms must add stores:

```javascript
let solarSystem = new Microcosm()

let Planets = {
  getInitialState() {
    return []
  }
}

solarSystem.addStore('planets', Planets)
```

This will mix the given store on top of a set of defaults (see
`src/Store.js`). Additionally, the Micocosm instance will now be
configured to use `MyStore` to manage state under the `my-store` key.

This state can be accessed like:

```javascript
app.get('planets')
```

## Listening to Actions

Stores listen to actions by implementing a register method:

```javascript
let Planets = {
  getInitialState() {
    return []
  },
  register() {
    return {
      [Actions.add]: this.add
    }
  },
  add(planets, props) {
    return planets.concat(props)
  }
}
```

The first argument of this method will always be the application state
for the particular key the Store is responsible for.

## Serializing State

Each store implements a `serialize` method. By default, this method
simply returns the current state. However `serialize` provides the
opportunity to reshape data before it leaves the system:

```
let Planets = {
  //... other methods
  serialize(planets) {
    return planets.filter(planet => planet.name !== 'Pluto')
  }
}
```

## Deserializing State

In contrast to `serialize`, `deserialize` allows one to parse data
before it _enters_ the system:

```
let Planets = {
  //... other methods
  deserialize(rawPlanets) {
    // Sort planets by diameter
    return rawPlanets.sort(function(a, b) {
      return a.diameter - b.diameter
    })
  }
}
```
