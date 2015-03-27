[![NPM](https://nodei.co/npm/microcosm.png?compact=true)](https://npmjs.org/package/microcosm)

---

### Heads up!

**This is not the next big flux framework**. It is largely an attempt to
simplify the authoring model for some other Viget tools. The roadmap
for Microcosm is heavily influenced by the needs of those projects. We
will follow [semver](http://semver.org/) to help maintain dependency
stability, but for the time being **it is probably safest to stay
clear of this project if you want stability.**

---

[![Travis CI](https://travis-ci.org/vigetlabs/microcosm.svg)](https://travis-ci.org/vigetlabs/microcosm)
[![Coverage Status](https://coveralls.io/repos/vigetlabs/microcosm/badge.svg)](https://coveralls.io/r/vigetlabs/microcosm)

---

# Microcosm

Microcosm is an experimental Flux inspired by [Om](https://github.com/omcljs/om),
[Flummox](https://github.com/acdlite/flummox) and [Elm](http://elm-lang.org). It is an
[isomorphic](http://artsy.github.io/blog/2013/11/30/rendering-on-the-server-and-client-in-node-dot-js/)
[Flux](http://facebook.github.io/flux).

Specifically, it addresses the problem of isolating state between
requests so that each page render does not leak information into the
next. State is contained within each unique Microcosm instance with
changes in state handled by pure functions.

## Opinions

Microcosm inserts a couple of opinions regarding the Flux
architecture:

1. Flux uses CONSTANT values to pass messages from Actions to
   Stores. Microcosm automatically generates these by assigning
   each Action function a unique `toString` method.
2. Microcosm expects immutability. When an action is fired, the
   associated handler in Stores are given the old state. State is
   updated by returning a new value.
3. Stores do not contain data, they _transform_ it. See the section on
   stores below.
4. All Actions that return promises will wait to resolve before
   dispatching.
5. Utilize language features over library abstraction as much as
   possible.

## What problems does it attempt to solve?

1. State isolation. Requests to render applications server-side should
   be as stateless as possible. Client-side libraries (such as [Colonel
   Kurtz](https://github.com/vigetlabs/colonel-kurtz)) need easy
   containment from other instances on the page.
2. A reasonable trade-off between the simplicity of singletons and the
   state-isolation of class instances.
3. Easy extension of core API and layering of features out of the
   framework's scope.

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

Microcosms implement a `get` method:

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
