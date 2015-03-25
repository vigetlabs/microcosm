Important! This is largely an exploratory repo, used to vet some ideas
within Flux/React and support other Viget tools. We will follow semver
to help maintain dependency stability, but **you should probably stay clear
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

Microcosm injects a a couple of opinions regarding the Flux
architecture:

1. Typically Flux uses CONSTANT values to pass messages from Actions
   to Stores. Microcosm automatically generates these by assigning
   each Action function a unique `toString` method.
2. Microcosm expects immutability. When an action is fired, the
   associated handler in Stores are given the old state. State is
   updated by returning a new value.
3. Stores do not contain data, they _shape_ it. See the section on
   stores below.
4. All Actions that return promises will wait to resolve before
   dispatching.
5. It should be easily to embed in libraries. Additional features such
   should be able to layer on top.
6. It should utilize language features over implementation details as
   much as possible.

## Design

Without getting too lofty, this is roughly the ideal scenario for a
Microcosm:

```
                                                    |--> [Store] ---|
[app.send] ------> [Action] ------> [Dispatcher] ---+--> [Store] ---+--> [app.shouldUpdate?]
   ^                                                |--> [Store] ---|            |
   |                                                                             |
   |                                                                             v
[External Services] <--------------------------------------------------------- [YES]
   |- User Interface
   |- Router
   |- Firebase sync
```

## Writing a Microcosm

A new app starts out as an extension of the `Microcosm` class:

```javascript
import Microcosm from 'microcosm'

class MyApp extends Microcosm {
  // Great things await
}
```

A microcosm is solely responsible for managing a global state
object. This value is assigned initially through `getInitialState`,
much like a react component:

```javascript
import Microcosm from 'microcosm'

class MyApp extends Microcosm {
  // This is actually the default implementation
  getInitialState() {
    return {}
  }
}
```

Although a microcosm is exclusively responsible for managing its own
state, `stores` shape how that data is changed:

```javascript
import Microcosm from 'microcosm'

let Messages = {
  getInitialState() {
    return []
  },
  toString() {
    return 'messages'
  }
}

class MyApp extends Microcosm {
  constructor() {
    super()
    this.addStore(Messages)
  }
  getInitialState() {
    return {}
  }
}
```

Now the `Messages` store will be responsible for shaping the data kept
within the `messages` key of this app's state.

Requests to change this data can be handled with `Actions`. An action
is simply a function that has been tagged with a unique
identifier. The `tag` module included with `Microcosm` can do just
that:

```javascript
import Microcosm, { tag } from 'microcosm'

let Actions = {
  createMessage(options) {
    // Here, we are simply returning options. However this
    // gives you an opportunity to modify parameters before they
    // are sent to stores
    return options
  }
}

let Messages = {
  getInitialState() {
    return []
  },
  [Actions.createMessage](oldState, parameters) {
    return oldState.concat(parameters)
  },
  toString() {
    return 'messages'
  }
}

class MyApp extends Microcosm {
  constructor() {
    super()
    this.addStore(Messages)
  }
  getInitialState() {
    return {}
  }
}
```

`MyApp` is now setup to accept actions, filtering them through the
`Messages` store before saving them. More information on how to
trigger actions and retrieve state follows.

## How Actions work

Actions are simply functions. They must implement a `toString` method
so that stores can know when to respond to them. For those familiar
with traditional flux, this `toString` method replaces the need to
maintain constants for each action type.

Fortunately, the `tag` function makes this quite mangeable:

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

Microcosms implement a `send` method. This will run execute a given
action with an arbitrary number of arguments (following the first).

This works like:

```javascript
app.send(Messages.create, 'This property will be passed to the dispatcher')
```

### Currying actions

`send` automatically curries invocations that do not include the
expected number of arguments. To repeat the previous example with currying:

```javascript
let create = app.send(Messages.create)
create('This property will be passed to the dispatcher')
```

Technically, this is even possible (but you didn't hear it from me):

```javascript
let sum = (a, b) => a + b
app.send(sum)(2, 3) // => 5
```

## How Stores work

Stores are plain objects. They must implement a `getInitialState` and
`toString` method. They listen to actions by providing methods at
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

Each store manages a subset of a global state object owned by an
individual Microcosm instance. By returning a new state object within
responses to actions, they modify state.

Microcosm will use `getInitialState` to produce the initial value for
the subset a store manages.

Unlike actions, stores must be registered with the system. There are
two reason for this. First: to tell Microcosm what Stores should be
responsible for managing state. Second: to dictate the priority of
dispatcher multicasting (similar to `waitFor` in the standard Flux
dispatcher)

```javascript
class App extends Microcosm {
  constructor(seed) {
    super(seed)

    // Called first:
    this.addStore(Messages)

    // Called second:
    this.addStore(OtherStoreThatDependsOnMessages)
  }
}
```

### Getting the value out of a store

Similar to a `Map`, microcosms implement a `get` and `set`
method. `set` should never be called directly, however it is exposed
should you wish to define your own method of assignment. As for `get`:

```javascript
app.get(Store)
```

This works because the app accesses the internal state object
(returned initially from `app.getInitialState`) using `Store` as a
key. Since the store implements a `toString` method, it coerces into
the proper key and returns the expected value.

## Listening to changes

All Microcosm instances are event emitters. They emit a single change event that you can subscribe to like:

```javascript
let app = new Microcosm()

// Add a callback
app.listen(callback)

// Remove a callback
app.ignore(callback)

// Force an emission
app.pump()
```

## Additional Notes

The philosophy behind change management is described very well in the
[Advanced Performance](http://facebook.github.io/react/docs/advanced-performance.html)
section of the React docs.
