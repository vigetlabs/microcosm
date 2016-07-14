# Microcosm

A tree-like data structure that keeps track of the execution order of
actions that are pushed into it, sequentially folding them together to
produce an object that can be rendered by a presentation library (such
as [React](https://facebook.github.io/react/)).

1. [API](#overview)
2. [Listening to Changes](#listening-to-changes)
3. [Running an instance](#running-an-instance)

## API

### `getInitialState()`

Generates the starting state for a Microcosm instance. This is the
result of dispatching `getInitialState` to all stores. It is
pure; calling this function will not update state.

### `push(action, ...parameters)`

Resolves an action. Sends the result and any errors to a given error-first callback.

```javascript
app.push(createPlanet, [{ name: 'Merkur' }], function(error, body) {
  if (error) {
    handleError(error)
  }
})
```

### `reset()`

Resets state to the result of calling `getInitialState()`

### `replace(data)`

Executes `deserialize` on the provided data and then merges it into
the current application state.

This function is great for bootstrapping data when rendering from the
server. It will not blow away keys that haven't been provided.

```javascript
app.replace({
  planets: [{ name: 'Tatooine' }, { name: 'Dagobah' }]
})
```

### `addPlugin(plugin, options)`

Pushes a plugin in to the registry for a given microcosm.
When `app.start()` is called, it will execute plugins in the order in
which they have been added using this function.

[See the documentation on plugins](plugins.md).

```javascript
app.addPlugin(saveToLocalStorage, { key: 'SolarSystem' })
```

### `addStore(key, config)`

Generates a store based on the provided `config` and assigns it to
manage the provided `key`. Whenever this store responds to an action,
it will be provided the current state for that particular key.

[See the documentation on stores](stores.md).

```javascript
app.addStore('planets', planetsConfig)
```

### `serialize()`

Returns an object that is the result of transforming application state
according to the `serialize` method described by each store.

```javascript
app.serialize() // => { planets: [...] }
```

### `deserialize(data)`

For each key in the provided `data` parameter, transform it using the
`deserialize` method provided by the store managing that key. Then
fold the deserialized data over the current application state.

```javascript
app.deserialize(data) // => cleaned data
```

### `toJSON()`

Alias for `serialize`

### `prepare(action, [...action arguments])`

Partially applies `push`. Sucessive calls will append new parameters (see `push()`)

## Listening to changes

```javascript
let app = new Microcosm()

// Add a callback
app.listen(callback)

// Remove a callback
app.ignore(callback)
```

## Running an instance

`Microcosm::start` begins an application. This will setup initial
state, run plugins, then execute a callback:

```
let app = new Microcosm()

app.start(function(error) {
  // Now do something
})
```
