# Domains

1. [Overview](#overview)
2. [Creating Domains](#creating-domains)
3. [Subscribing to different action states](#subscribing-to-different-action-states)
4. [API](#api)

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

## Creating Domains

There are two ways to create a domains: as a class, and as a plain object. The
usage is roughly the same for both versions, the class form can additionally
take advantage of having a `constructor`.

### Domains as classes

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

### Domains as plain objects

```javascript
const Domain = {
  setup (repo, options) {
    // Run startup behavior
  },
  teardown (repo) {
    // Clean up any setup behavior
  },
  handleAction (state, payload) {
    let newState = { ...state, prop: payload.prop }

    return newState
  },
  register () {
    return {
      [action] : this.handleAction
    }
  }
}

repo.addDomain('key', Domain)
```

Microcosm calls `Object.create` on the simple object form, preventing any
assignments within the Domain from polluting other instances. In this way, they
are somewhat similar to the class form.

## Subscribing to different action states

Domains can provide a `register` method to dictate what actions they
listen to:

```javascript
const Domain = {

  // ... Other domain methods

  register () {
    return {
      [action]: {
        open: this.setLoading,
        loading: this.setProgress,
        done: this.addRecord,
        error: this.setError,
        cancelled: this.setCancelled
      }
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
  getInitialState () {
    return []
  }
}
```

### `setup(repo, options)`

Setup runs right after a domain is added to a Microcosm, but before it runs
getInitialState. This is useful for one-time setup instructions.

Options are passed from the second argument of
`repo.addDomain`. Additionally, `options.key` indicates the key where
the domain was mounted:

```javascript
let repo = new Microcosm()

class Planets {
  setup(repo, options) {
    console.log(options.key) // "planets"
  }
}

repo.addDomain('planets', Planets)
```

### `teardown(repo)`

Runs whenever a Microcosm is torn down. This usually happens when a
Presenter component unmounts. Useful for cleaning up work done in
`setup()`.

### `serialize(staged)`

Allows a domain to transform data before it leaves the system. It gives
the domain the opportunity to reduce non-primitive values into
JSON.

For example, if using
[ImmutableJS](https://github.com/facebook/immutable-js), this might
look like:

```javascript
const Planets = {
  getInitialState () {
    return Immutable.List()
  },
  serialize (planets) {
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
  getInitialState () {
    return Immutable.List()
  },
  serialize (planets) {
    return planets.toJSON()
  },
  deserialize (raw) {
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
  register () {
    return {
      [addPlanet]: this.append
    }
  },
  append (planets, params) {
    return planets.concat(params)
  }
}

repo.push(Actions.add, { name: 'earth' }) // this will add Earth
```

### `Domain.defaults`

Specifies default options a Domain is instantiated with. This
provides a concise way to configure sensible defaults for setup
options:

```javascript
class Counter {
  static defaults = {
    start: 0
  }

  setup (repo, { start }) {
    console.log(start) // 0
  }
}

let repo = new Microcosm()

repo.addDomain('counter', Counter) // default start is 0
```

When instantiated, default options are determined in the following
order:

1. Microcosm defaults
2. Microcosm instantiation options
3. Domain defaults
4. Options passed to `repo.addDomain`.
