# Microcosm

1. [Overview](#overview)
2. [API](#api)

## Overview

A tree-like data structure that keeps track of the execution order of
actions that are pushed into it, sequentially folding them together to
produce an object that can be rendered by a presentation library (such
as [React](https://facebook.github.io/react/)).

## API

### `setup()`

Called whenever a Microcosm is instantiated. This provides a general
purpose hook for adding domains and other setup behavior.

```javscript
class SolarSystem extends Microcosm {
  setup() {
    this.addDomain('planets', Planets)
  }
}
```

### `getInitialState()`

Generates the starting state for a Microcosm instance. This is the
result of dispatching `getInitialState` to all domains. It is
pure; calling this function will not update state.

### `append(action)`

Appends an action to a Microcosm's history, however does not execute
it. This is useful for testing store responses to a specific action.

```javascript
let action = repo.append(createPlanet)

// Test that opening an action for a planet marks
// that planet as loading
action.open({ id: 'pluto' })
assert.equal(repo.state.planets.pluto.loading, true)

// And then test that closing the action moves marks
// the planet as no longer loading
action.resolve({ id: 'pluto' })
assert.falsy(repo.state.planets.pluto.loading)
```

### `push(action, ...parameters)`

Resolves an action. Sends the result and any errors to a given error-first callback.

```javascript
repo.push(createPlanet, { name: 'Merkur' })
```

### `reset(data, deserialize)`

Resets state to the result of `Microcosm::getInitialState()`. If the
first argument is provided, it will merge into this value. If the second
argument is true, Microcosm will call `deserialize` on the data.

### `patch(data, deserialize)`

Merges a data payload into the existing state. If the second argument
is true, Microcosm will call `deserialize` on the data.

```javascript
repo.patch({
  planets: [{ name: 'Tatooine' }, { name: 'Dagobah' }]
})
```

### `addDomain(key, config)`

Generates a domain based on the provided `config` and assigns it to
manage the provided `key`. Whenever this domain responds to an action,
it will be provided the current state for that particular key.

[See the documentation on domains](domains.md).

```javascript
repo.addDomain('planets', planetsConfig)
```

### `serialize()`

Serialize the Microcosm's state into a plain object. By default,
domains will pass through their current staged state
(pre-commit). Domains can change this behavior by implementing
`serialize`.

```javascript
repo.serialize() // => { planets: [...] }
```

### `deserialize(data)`

For each key in the provided `data` parameter, transform it using the
`deserialize` method provided by the domain managing that key. Then
fold the deserialized data over the current repo state.

```javascript
repo.deserialize(data) // => cleaned data
```

### `toJSON()`

Alias for `serialize`

### `prepare(action, ...params)`

Partially applies `push`. Sucessive calls will append new parameters
(see `push()`)

### `checkout(action)`

Change the current focal point of the history data structure used by
Microcosm. This is useful for undo/redo, or for debugging purposes:

```javascript
const red = repo.push(changeColor, "red")
const green = repo.push(changeColor, "green")
const blue = repo.push(changeColor, "blue")

console.log(repo.state.color) // "blue"

// Undo:
repo.checkout(blue.parent)
console.log(repo.state.color) // "green"

// Redo:
repo.checkout(green.next)
console.log(repo.state.color) // "blue"

// Skip:
repo.checkout(red)
console.log(repo.state.color) // "red"
```

The `maxHistory` option passed into a Microcosm dictates how far back
it will track history. By default, it will only track incomplete
actions. Try setting `maxHistory` to a specific value, like `10` or `100`.

### `on(event, callback)`

Adds an event listener to a Microcosm instance. Currently, this events
are:

- `change`: The Microcosm instance updated state

```javascript
const repo = new Microcosm()

repo.on('change', callback)
```

### `off(event, callback)`

Remove an event listener.

```javascript
// Remove a callback
repo.off('change', callback)
```



### fork()

Instantiate a new Microcosm that shares the same action history as
another. This is useful for producing "umbrellas" of Microcosms,
particularly within a tree of UI components.

```javascript
// Here we have a repo that manages a roster of people
var roster = new Microcosm()
roster.addStore('people', People)

// But what if we want to focus on a single page of users?
// Fork gives us an answer for that
var fork = roster.fork()

// Adding a domain to a fork does not add it to the parent
fork.addDomain('page', PaginatedPeople)

// Pushing from a fork will add an action to the same
// history as the parent
fork.push(getPeople)
```
