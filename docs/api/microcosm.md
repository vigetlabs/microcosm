# Microcosm

1. [API](#overview)
2. [Listening to Changes](#listening-to-changes)
3. [Running an instance](#running-an-instance)

## API

### `getInitialState()`

Generates the starting state a microcosm starts with. The reduction of
calling `getInitialState` on all stores.

This function is usually not called directly. However it is open to
extension. The only requirement is that it returns an object primitive.

### `reset()`

Resets state to the result of calling `getInitialState()`

### `get(key)`

Returns the current value for a given `key`. This key is often managed
by a Store.

```javascript
app.get('planets') // => [{ name: 'Mercury'}, { name: 'Venus' }, ...]
```

### `set(key, value)`

For the given `key`, replaces its value. This will trigger a change
event.

```javascript
app.set('planets', [{ name: 'Naboo' }])
```

This method is used internally to update state and it shouldn't
typically be used directly. However it is exposed in case a plugin
wants to keep track of some state unique to an app.

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

### deserialize(data)

For each key in the provided `data` parameter, transform it using the
`deserialize` method provided by the store managing that key. Then
fold the deserialized data over the current application state.

```javascript
app.deserialize(data) // => cleaned data
```

### `valueOf()`

Returns a clone of the current application state

```javascript
app.valueOf() // => clone of app state
```

### `toJSON()`

Alias for `serialize`

### `toObject()`

Alias for `valueOf()

### `start(...callbacks)`

Starts an application. It does a couple of things:

1. Calls `this.reset()` to determine initial state
2. Runs through all plugins, it will terminate if any fail
3. Executes the provided list of callbacks, passing along any errors
   generated if installing plugins fails.

```javascript
app.start(function(error) {
  if (!error) {
    console.log("Enter hyperspace!")
  }
})
```

### `push(action, ...params)`

Resolves an action. If it resolved successfully, it dispatches that
the resulting parameters to registered stores for transformation.

[See the documentation on actions](actions.md).

```javascript
app.push(createPlanet, { name: 'Merkur' })
```

### `prepare(action, ...arguments)`

Partially applies `push`.

### `dispatch(action, params)`

Sends a message to each known store asking if it can respond to the
provided action. If so, takes the returned new state for that store's
managed key and assigns it as new state.

This will trigger a change event if any of the stores return a new
state.

Normally, this function is not called directly. `dispatch` is fire and
forget. For almost every use case, `app.push` should be instead as it
provides a mechanism for error handing and callbacks.

```javascript
app.dispatch(createPlanet, { name: 'Coruscant' })
```

## Listening to changes

```javascript
let app = new Microcosm()

// Add a callback
app.listen(callback)

// Remove a callback
app.ignore(callback)

// Force an emission
app.emit()
```

## Running an instance

`Microcosm::start` begins an application. This will setup initial
state, run plugins, then execute a callback:

```
let app = new Microcosm()

app.start(function() {
  // Now do something
})
```
