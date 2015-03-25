# Stores

1. [Overview](#overview)
2. [API](#api)
3. [Installing Stores](#installing-stores)
4. [Listening to Actions](#listening-to-actions)

## Overview

The responsibility of a Store in Microcosm is to transform state from
one form to the next. They do not provide any storage of their own
(although technically this isn't enforced by Microcosm).

## API

Microcosms call several methods on Stores to help shape information:

```javascript
var store = {
  getInitialState() {
    // return a starting value
  },
  serialize(state) {
    // transform data when app.toJSON() is called
  },
  deserialize(state) {
    // parse data when app.seed is called
  },
  toString() {
     // return a unique identifier
  }
}
```

Of these methods, only the `toString` method is required. If this
method is not implemented Microcosm will quickly throw an error:

```
Stores must implement a toString() method
```

## Installing Stores

Microcosms must add stores:

```javascript
let app = new Microcosm()

let MyStore = {
  toString() {
    return 'mystore'
  }
}

app.addStore(MyStore)
```

This will mix the given store on top of a set of defaults (see
`src/Store.js`) and run `getInitialState()` if it is
provided. Additionally, the Micocosm instance will now be configured
to use `MyStore` to manage state under the `mystore` key (because of
the `toString` method).

This state can be accessed like:

```javascript
app.get(MyStore)
```

## Listening to Actions

Stores listen to actions by implement them as methods:

```javascript
let MyStore = {
  [Action.add](state, record) {
    return state.concat(record)
  },
  toString() {
    return 'my-store'
  }
}
```

The first argument of this method will always be the application state
for the given key provided by `toString()`. It is the responsibility
of the store to return the next state as a result of actions.
