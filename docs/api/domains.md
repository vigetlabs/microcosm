# Domains

1. [Overview](#overview)
2. [Subscribing to different action states](#subscribing-to-different-action-states)
3. [API](#api)

## Overview

Domains define the rules in which resolved actions are converted into
new state. They are added to a Microcosm instance using `addDomain`:

```javascript
// Mount a domain that operates on a specific key in repo state.
// Any operations the domain handles are recorded at `repo.state.key`:
repo.addDomain('key', Domain)

// Mount a domain that operates on all repo state, handlers will
// write directly to `repo.state` itself:
repo.addDomain(Domain)
```

Domains do not enforce any particular structure. However specific
methods can be defined on domains to configure behavior at key points
in a Microcosm's lifecycle.

## Subscribing to different action states

Domains can provide a `register` method to dictate what actions they
listen to:

```javascript
const Domain = {

  // ... Other domain methods

  register() {
    return {
      [action.open]      : this.setLoading,
      [action.loading]   : this.setProgress,
      [action.done]      : this.addRecord,
      [action.error]     : this.setError,
      [action.cancelled] : this.setCancelled
    }
  }
}
```

`action` referenced directly, like `[action]: callback`, refer to the
`done` state.

## API

### `getInitialState()`

Generate the starting value for the particular state this domain is
managing. This will be called by the Microcosm using this domain when
it is started.

```javascript
var Planets = {
  getInitialState() {
    return []
  }
}
```

### `setup()`

Setup runs right after a domain is added to a Microcosm, but before it runs
getInitialState. This is useful for one-time setup instructions.

### `serialize(staged)`

Allows a domain to transform data before it leaves the system. It gives
the domain the opportunity to reduce non-primitive values into
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

Returns an object mapping actions to methods on the domain. This is the
communication point between a domain and the rest of the system.

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

How should a domain actually write to `repo.state`? This is useful for serializing a complex data structure, such as a `Map`, into form easier for public consumption:

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

### `shouldCommit(last, next)`

Based on the next and last state, should `commit` be called? Useful for
custom change management behavior.

```javascript
import Immutable from 'immutable'

const Planets = {
  getInitialState() {
    return Immutable.Map()
  },

  shouldCommit(last, next) {
    return Immutable.is(last, next)
  }

  commit(next) {
    return Array.from(next.values())
  }
}
```
