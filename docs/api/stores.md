# Stores

1. [Overview](#overview)
2. [Subscribing to different action states](#subscribing-to-different-action-states)
3. [API](#api)

## Overview

Stores define the rules in which resolved actions are converted into
new state. They are added to a Microcosm instance using `addStore`:

```javascript
// Mount a store that operates on a specific key in repo state.
// Any operations the store handles are recorded at `repo.state.key`:
repo.addStore('key', Store)

// Mount a store that operates on all repo state, handlers will
// write directly to `repo.state` itself:
repo.addStore(Store)
```

Stores do not enforce any particular structure. However specific
methods can be defined on stores to configure behavior at key points
in a Microcosm's lifecycle.

## Subscribing to different action states

Stores can provide a `register` method to dictate what actions they
listen to:

```javascript
const Store = {

  // ... Other store methods

  register() {
    return {
      [action.open]      : this.setLoading,
      [action.loading]   : this.setProgress,
      [action.done]      : this.addRecord,
      [action.failed]    : this.setError,
      [action.cancelled] : this.setCancelled
    }
  }
}
```

`action` referenced directly, like `[action]: callback`, refer to the
`done` state.

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
const Planets = {
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
const Planets = {
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
import { addPlanet } from '../actions/planets'

const Planets = {
  //...
  register() {
    return {
      [addPlanet]: this.append
    }
  },
  append(planets, params) {
    return planets.concat(params)
  }
}

repo.push(Actions.add, { name: 'earth' }) // this will add Earth
```

### `commit(next)`

How should a store actually write to `repo.state`? This is useful for serializing a complex data structure, such as a `Map`, into form easier for public consumption:

```javascript
import Immutable from 'immutable'

const Planets = {
  getInitialState() {
    return Immutable.Map()
  },

  commit(next) {
    return Array.from(next.values())
  }
}
```

### `shouldCommit(next, last)`

Based on the next and last state, should `commit` be called? Useful for
custom change management behavior.

```javascript
import Immutable from 'immutable'

const Planets = {
  getInitialState() {
    return Immutable.Map()
  },

  shouldCommit(next, last) {
    return Immutable.is(next, last)
  }

  commit(next) {
    return Array.from(next.values())
  }
}
```
