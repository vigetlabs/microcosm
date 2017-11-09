# Microcosm

1. [Overview](#overview)
2. [API](#api)

## Overview

The Microcosm class provides a centralized place to store application
state, dispatch actions, and track changes.

### Creating a Microcosm

All Microcosm apps start by instantiating a Microcosm class. We call
this instance of Microcosm a "repo":

```javascript
let repo = new Microcosm()
```

### Options

The first argument of the Microcosm constructor is an object of
options:

```javascript
let repo = new Microcosm({ maxHistory: 10 })
```

Microcosm supports the following options:

1. `maxHistory:number`: In Microcosm, data is changed by responding
   to [actions](./actions.md). This builds up a history that can be
   useful for debugging and undo/redo behavior. By default, Microcosm
   gets rid of any old actions to reduce memory usage. By setting
   `maxHistory`, you can tell Microcosm to hold on to those actions.
2. `batch:boolean`: When set to true, change events within a short
   period of time will be grouped together
   using
   [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback). Defaults
   to false. **Important:** this makes change events asynchronous.
2. `updater:function`: `batch:true` should be sufficient for nearly
   all use cases. However this option overrides the default batch
   behavior if it proves problematic for your app. See
   the [Batch Updates](../recipes/batch-updates.md) recipe for more
   information.

Feel free to add additional options to fit your use case. Any options
you provide to Microcosm are passed into the `setup` lifecycle method:

```javascript
class Repo extends Microcosm {

  setup (options) {
    console.log(options) // { autosave: true }
  }

}

let repo = new Repo({ autosave: true })
```

## API

### `setup(options)`

Called whenever a Microcosm is instantiated. This provides a general
purpose hook for adding domains and other setup
behavior. Instantiation options are passed in as the first argument.

```javascript
class SolarSystem extends Microcosm {
  setup (options) {
    this.addDomain('planets', Planets)
  }
}
```

Setup receives options passed from instantiation. For example:

```javascript
class SolarSystem extends Microcosm {
  setup(options) {
    console.log(options) // { test: true }
  }
}

let repo = new SolarSystem({ test: true })
```

### `teardown()`

Called whenever a Microcosm is shut down. Do any necessary clean up
work within this callback.

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

### `reset(data, deserialize?)`

Resets state. The new state is the result of folding the provided data
over `getInitialState()`. If no data is provided, the repo will revert
to this initial value. If the second argument is true, Microcosm will
call `deserialize` on the data.

```javascript
repo.reset({
  planets: [{ name: 'Tatooine' }, { name: 'Dagobah' }]
})
```

### `patch(data, deserialize?)`

Merges a data payload into the existing state. If the second argument
is true, Microcosm will call `deserialize` on the data.

```javascript
repo.patch({
  planets: [{ name: 'Tatooine' }, { name: 'Dagobah' }]
})
```

### `addDomain(key, config, options)`

Generates a domain based on the provided `config` and assigns it to
manage the provided `key`. Whenever this domain responds to an action,
it will be provided the current state for that particular key.

`options` passed as the third argument are sent into a domain's
`setup` method and, if using a class, the constructor is instantiated
with the provided options and associated repo.

[See the documentation on domains](domains.md).

```javascript
class Domain {
  setup (repo, options) {
    // Run startup behavior
  }
  teardown (repo) {
    // Clean up any setup behavior
  }
  handleAction (state, payload) {
    // Old state in, new state out...
    let newState = { ...state, prop: payload.prop }

    return newState
  }
  register () {
    return {
      [action] : this.handleAction
    }
  }
}

repo.addDomain('key', Domain)
```

### `addEffect(config, options)`

Generates an effect based on the provided `config`. `options` passed
as the second argument are sent into a effect's `setup` method and, if
using a class, the constructor is instantiated with the provided
options and associated repo.

[See the documentation on effects](effects.md).

```javascript
class Effect {
  setup (repo, options) {
    // Run starting behavior
  }
  teardown (repo) {
    // Clean up
  }
  handleAction (repo, payload) {
    // Respond once to an action changing states
  }
  register () {
    return {
      [action] : this.handleAction
    }
  }
}

repo.addEffect(Effect)
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

**Important**: If the provided data is a string, Microcosm will attempt to run
JSON.parse on the value:

```javascript
let raw = '{ "planets" : [{ "name": "Earth" }]}'
repo.deserialize(raw) // => { planets: [...] }
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

Adds an event listener to a Microcosm instance. Currently, these events
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



### `fork()`

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

### `parallel([...actions])`

Create a new "group" action bound to the resolution of a list of
actions. If all actions resolve or cancel, the group action will
+resolve. If any action is rejected, the group action fails. If all
actions resolve, their respective payloads will be available in the
`onDone` callback:

```javascript
let group = repo.parallel([
  repo.push(actionOne),
  repo.push(actionTwo)
])

group.onDone(function ([answer1, answer2]) {
  console.log('hurrah!', answer1, answer2)
})
```

### `Microcosm.defaults`

Specifies default options a Microcosm is instantiated with. This
provides a concise way to configure sensible defaults for setup
options:

```javascript
class Repo extends Microcosm {
  static defaults = {
    saveInterval: 5000
  }

  setup ({ saveInterval }) {
    // ...
    this.addEffect(Autosave, { saveInterval })
  }
}
```

When instantiated, default options are determined in the following
order:

1. Microcosm defaults
2. Subclass defaults
3. Instantiation options
