Important! This is largely an exploratory repo, used to vet some ideas
within Flux/React and support other Viget tools. We will follow semver
to help prevent breaking changes, but **you should probably stay clear
of this implementation.**

---

[![Travis CI](https://travis-ci.org/vigetlabs/microcosm.svg)](https://travis-ci.org/vigetlabs/microcosm)
[![Coverage Status](https://coveralls.io/repos/vigetlabs/microcosm/badge.svg)](https://coveralls.io/r/vigetlabs/microcosm)

---

# Microcosm

Microcosm is an experimental Flux inspired by
[Flummox](https://github.com/acdlite/flummox) and many ideas within
[Elm](elm-lang.org). It is an
[isomorphic](http://artsy.github.io/blog/2013/11/30/rendering-on-the-server-and-client-in-node-dot-js/)
[Flux](facebook.github.io/flux).

Specifically, it addresses the problem of isolating state between
requests so that each page render does not leak information into the
next. State is contained within each unique Microcosm instance with
changes in state handled by pure functions.

## Opinions

Microcosm injects a couple of opinions regarding the Flux
architecture:

1. Typically Flux uses CONSTANT values to pass messages from Actions
   to Stores. Microcosm automatically generates these by assigning
   each Action function a unique `toString` method.
2. Microcosm expects immutability. When an action is fired, the
   associated handler in Stores are given the old state. State is
   updated by returning a new value.
3. All Actions return promises when called. This allows error
   validation for forms and easy prefetching of information
   when rendering on the server.

## How Actions work

Actions are simple objects that have been tagged with unique identifiers:

``` javascript
import tag from 'microcosm/tag'

let Messages = tag({

  create(message) {
    return { message, time: new Date() }
  }

})
```

`tag` returns a clone of a given object with `toString()` methods which
returning unique identifiers. This tells the Microcosm how to process
actions (and lets them stringify to unique keys in Stores, seen
later).

You can fire them like:

```javascript
app.send(Messages.create, 'This property will be passed to the dispatcher')
```

## How Stores work

Stores are plain objects. They must implement a `getInitialState` and
`toString()` method. They listen to actions by providing methods at
the unique signature of an Action, like:

```javascript

let MessageStore = {

  getInitialState(seed) {
    return []
  },

  [Messages.create](oldState, message) {
    return oldState.concat(message)
  },

  toString() {
    return 'MessageStore'
  }
}
```

Each Store instance manages a subset of a global state object owned by an
individual Microcosm instance. By returning a new state object within responses
to actions, they modify state.

Microcosm will use `getInitialState` to produce the initial value for the subset
a store manages.

Unlike actions, stores must be registered with the system. There are two reason for this. First: to tell Microcosm what Stores should be responsible for managing state. Second: to dictate the priority of dispatcher multicasting (similar to `waitFor` in the standard Flux dispatcher)

```javascript
class App extends Microcosm {
  constructor(seed) {
    super(seed)

    this.addStore(Messages)
  }
}
```

## Additional Notes

The philosophy behind change management is described very well in the
[Advanced Performance](http://facebook.github.io/react/docs/advanced-performance.html)
section of the React docs.
