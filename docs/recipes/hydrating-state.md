# Hydrating State

Often times, your application will need to start with a specific initial
state. For example, when conducting server side rendering, your
application should awaken on the client with the same exact
information.

Microcosm ships with several utilities that makes this process
simpler.

## Resetting state

Microcosm provides a `reset` method for wiping away the existing repo
state. This operation folds a data object over the result of calling
`getInitialState` on all domains:

```javascript
import Microcosm from 'microcosm'
import Immutable from 'immutable'

let repo = new Microcosm()

repo.addDomain('planets', {
  getInitialState () {
    return []
  }
})

// The initial state is an empty object
repo.state.planets // []

// Now reset the state with new data
repo.reset({ planets: [{ name: "Earth" }]})

// The repo now contains planets
repo.state.planets // [{ name: "Earth" }]

// Reset without a data payload
repo.reset()

// Since no planets were provided, the repo has reverted to
// the initial plents state
repo.state.planets // []
```

## Deserializing JSON into repo state

The second argument of `reset` is a boolean flag that indicates if
Microcosm should instruct domains to execute `deserialize` on the
provided data.

The primary use case for this is to convert a raw JavaScript object
into a complex data structure, such as an ImmutableJS data structure:

```javascript
import Microcosm from 'microcosm'
import Immutable from 'immutable'

let repo = new Microcosm()

repo.addDomain('planets', {
  getInitialState () {
    return Immutable.List()
  },

  deserialize (data) {
    return Immutable.fromJS(data)
  }
})

repo.reset({ planets: [{ name: "Earth" }]})

// The repo now contains planets
repo.state.planets // Immutable.List
```

## Serializing a repo into JSON

Microcosm implements a `toJSON` method that asks domains to convert
their managed state into a serializable form. This makes it easy to
convert complex data types into something that can be sent over the wire:

```javascript
import Microcosm from 'microcosm'
import Immutable from 'immutable'

let repo = new Microcosm()

repo.addDomain('planets', {
  getInitialState () {
    return Immutable.List()
  },
  serialize (list) {
    return list.toJSON()
  }
})

repo.serialize() // { planets: [] }
```

## Reset returns an action

Whenever `repo.reset()` is invoked, it returns an action to represent
the request. This is useful for handling errors during serialization,
such as when passing a raw string of invalid JSON content into
deserialization:

```javascript
import Microcosm from 'microcosm'

let repo = new Microcosm()

repo.addDomain('planets', {
  getInitialState () {
    return []
  }
})

let action = repo.replace("{ invalid json string}")

action.onError(function (error) {
  console.log(error) // JSON Parse error
})
```

Since the action was rejected, no data modification occurs. The
original state is protected.
