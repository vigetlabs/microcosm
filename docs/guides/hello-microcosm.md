# Hello, Microcosm

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
  create(message, send) {
    send(null, { message, time: new Date() })
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
