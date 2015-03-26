# Microcosm

1. [Overview](#overview)
2. [API](#api)
3. [Listening to Changes](#listening-to-changes)

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
  getInitialState() {
    // Assigns the default state. Most of the time this will not need
    // to be overridden, however if using something like ImmutableJS,
    // you could return a different data structure here.
    //
    // By default, it will return {}
  }
  shouldUpdate(prev, next) {
    // Whenever an action is dispatched, the resulting state
    // modification will be diffed to identify if a change event
    // should fire.
    //
    // The default strategy for determining that state has changed
    // is a simple shallow equals check
  }
  seed(data) {
    // Tells the microcosm how it should handle data injected from
    // sources.
    //
    // By default, it will clean the data with `deserialize` and
    // then override the existing data set with the new values
    //
    // seed will trigger a change event
  }
  swap(nextState) {
    // Given a new state, if equality fails using `shouldUpdate`,
    // assign the new state and emit an event
  }
  merge(object) {
    // How state should be re-assigned. This function is useful to
    // override with the particular method of assignment for merging
    // data for whatever is returned from from `getInitialState`
  }
  get(key) {
    // How state should be retrieved. This function is useful to
    // override with the particular method of retrieval for the data
    // structure returned from `getInitialState`
  }
  prepare(fn, ...params) {
    // Returns a partially applied version of `send`. Useful
    // for concise callbacks in React components
  }
  send(fn, ...params) {
    // Responsible for pushing an action through the system.
    // `send`.
    //
    // If `fn(...params)` returns a promise, it will wait for this
    // promise to resolve.
  }
  dispatch(action, body) {
    // Multicasts an action to all known stores, reducing down the
    // resulting callbacks into a change set. If state changes, it
    // will trigger a change event after assigning the new state
  }
  addStore(...stores) {
    // For each store, folds over a default interface and then assigns
    // the result of `store.getInitialState` to the associated key for
    // that store (defined by store.toString())
    //
    // Finally, it will concatenate the processed stores into the
    // list of known stores.
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
}
```

## Listening to Changes

All microcosms inherit from `src/Heartbeat.js`. Heartbeat is an event
emitter with a single event:

```javascript
let app = new Microcosm()

// Add a callback
app.listen(callback)

// Remove a callback
app.ignore(callback)

// Force an emission
app.pump()
```
