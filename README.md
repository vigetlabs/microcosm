![microcososm](http://f.cl.ly/items/36051G3A2M443z3v3U3b/microcososm.svg)

---

### Heads up!

**This is not the next big flux framework**. It is an attempt to
simplify the authoring model for some other Viget tools. The roadmap
for Microcosm is heavily influenced by the needs of those projects. We
will follow [semver](http://semver.org/) to help maintain dependency
stability, but for the time being **it is probably safest to stay
clear of this project if you want stability.**

---

[![Circle CI](https://circleci.com/gh/vigetlabs/microcosm.svg?style=svg)](https://circleci.com/gh/vigetlabs/microcosm)

---

[![NPM](https://nodei.co/npm/microcosm.png?compact=true)](https://npmjs.org/package/microcosm)

Microcosm is a Flux implementation inspired by [Om](https://github.com/omcljs/om),
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
object. Although a microcosm is exclusively responsible for managing
its own state, `stores` shape how that data is changed:

```javascript
import Microcosm from 'microcosm'

let Messages = {
  getInitialState() {
    return []
  }
}

class MyApp extends Microcosm {
  constructor() {
    super()
    this.addStore('messages', Messages)
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
  }
}

class MyApp extends Microcosm {
  constructor() {
    super()
    this.addStore('messages', Messages)
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

```javascript
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

Stores are plain objects. They listen to actions by providing methods
at the unique signature of an Action, like:

```javascript

let MessageStore = {

  getInitialState(seed) {
    return []
  },

  [Messages.create](oldState, message) {
    return oldState.concat(message)
  }
}
```

Each store manages a subset of a global state object owned by an
individual Microcosm instance. By returning a new state object within
responses to actions, they modify state.

Microcosm will use `getInitialState` to produce the initial value for
the subset a store manages when an instance is started.

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
    this.addStore('messages', Messages)

    // Called second:
    this.addStore('other-store', OtherStoreThatDependsOnMessages)
  }
}
```

### Getting the value out of a store

Microcosms implement a `get` method:

```javascript
app.get('messages')
```

This will pull the `messages` key out of global application state.

## Listening to changes

All Microcosm instances are event emitters. They emit a single change
event that you can subscribe to like:

```javascript
let app = new Microcosm()

// Add a callback
app.listen(callback)

// Remove a callback
app.ignore(callback)

// Force an emission
app.emit()
```

## Booting things up

`Microcosm::start` begins an application. This will setup initial
state, run plugins, then execute a callback:

```javascript
let app = new Microcosm()

app.start(function() {
  // Now do something
})
```

## Adding plugins

Plugins allow microcosm instances to be extended with additional
functionality outside of the scope of the framework. The only
requirement is that they take the form of an object with a `register`
method:

```javascript
let Logger = {

  log(data) {
    console.log('Change: ', data)
  },

  register(app, options, next) {
    app.listen(i => log(app.toJSON()))
  }

}

// The second argument of addPlugin contains options that will be
// sent to the plugin
app.addPlugin(logger, {})

// Start executes all plugins in the order in which they are added
app.start()
```


## Additional Notes

The philosophy behind change management is described very well in the
[Advanced Performance](http://facebook.github.io/react/docs/advanced-performance.html)
section of the React docs.

## Inspiration

- http://www.vpri.org/pdf/rn2008001_worlds.pdf
- https://github.com/omcljs/om
- https://elm-lang.org
