# Stores API

Stores define the rules in which resolved actions are converted into
new state. They are added to a Microcosm instance using `addStore`:

```
// Mount a store that operates on a specific key in application state.
// Any operations the store handles are recorded at `app.state.key`:
app.addStore('key', Store)

// Mount a store that operates on all application state, handlers will
// write directly to `app.state` itself:
app.addStore(Store)
```

Stores do not enforce any particular structure. However specific
methods can be defined on stores to configure behavior at key points
in a Microcosm's lifecycle.

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

### `willReset()`

Called whenever an application will reset to a new state. Internally, this is used
to non-destructively reset application within transaction history.

```javascript
var Planets = {
  willReset(state, next) {
    return next
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
