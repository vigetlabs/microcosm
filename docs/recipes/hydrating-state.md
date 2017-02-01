# Hydrating State

Often times your application will need to start in a specific
state. For example: server rendered pages that need to be hydrated in
a specific state, or applications that save data in `localStorage` for
return visits.

Microcosm ships with several utilities that make this easy.

## Resetting state

The `reset` method wipes away existing state, replacing it with new
data. Where domain keys are unspecified, values are replaced with the
result of `getInitialState`:

```javascript
import Microcosm from 'microcosm'

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

Data doesn't always ship in a form useable by a repo. By setting the
second argument of `reset` to true, it tells the repo to execute
`deserialize` on the provided data before entering it.

This is primarily to accommodate complex data libraries such as
ImmutableJS. When resetting, we can tell a domain to convert raw data
using the ImmutableJS API:

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

repo.reset({ planets: [{ name: "Earth" }]}, true)

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

JSON.stringify(repo) // "{ "planets": [] }"
```
