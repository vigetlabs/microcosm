# Microcosm

1. [Overview](#overview)
2. [API](#api)
3. [Listening to Changes](#listening-to-changes)
4. [Running an instance](#running-an-instance)

## Overview

Microcosm is a flavor of Flux specifically designed to address the
problem of state isolation. More specifically, these are the problems
it sets out to solve:

1. Complete separation of state between instances of Microcosm without
being bogged down by unique instances of Stores and Actions.
2. Small enough for library use.
3. Keep state in one place. Stores should _transform_ data, not keep
   it.

## API

```javascript
class MyApp extends Microcosm {

  push(fn, ...params) {
    // Responsible for pushing an action through the system.
    // `send`.
    //
    // If `fn(...params)` returns a promise, it will wait for this
    // promise to resolve.
  }

  pull(key) {
    // If a key is provided, return that entry in state. Otherwise
    // return all state
  }

  prepare(fn, ...params) {
    // Returns a partially applied version of `push`. Useful
    // for concise callbacks in React components
  }

  replace(data) {
    // Tells the microcosm how it should handle data injected from
    // sources.
    //
    // By default, it will clean the data with `deserialize` and
    // then override the existing data set with the new values
  }

  addStore(store) {
    // Folds over a default interface and then assigns
    // the result of `store.getInitialState` to the associated key for
    // that store (defined by store.toString())
  }

  addPlugin(plugin) {
    // Verifies required api and adds available plugin. This will be
    // called on app.start()
  }

  serialize(state) {
    // Transforms the internal state of a microcosm into a digestable
    // form. toJSON uses this method.
    //
    // By default, it will reduce over all stores, saving the result of
    // `store.serialize(state)` to its associated key
  }

  deserialize(state) {
    // Defines how to clean data before it is injected into the
    // This is used by seed. Like `serialize`, it reduces over all
    // stores, returning the result of `store.deserialize(data)`
  }

  toJSON() {
    // A default implementation of serialization. Just returns `this.serialize()`
  }

  toObject() {
    // Return a flat copy of state
  }

  start(...callbacks) {
    // Setup initial state, run plugins, then execute callbacks
  }

}
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
