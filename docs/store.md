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
  }

}
```

## Installing Stores

Microcosms must add stores:

```javascript
let app = new Microcosm()

let MyStore = {}

app.addStore('my-store', MyStore)
```

This will mix the given store on top of a set of defaults (see
`src/Store.js`). Additionally, the Micocosm instance will now be
configured to use `MyStore` to manage state under the `my-store` key.

This state can be accessed like:

```javascript
app.get('my-store')
```

## Listening to Actions

Stores listen to actions by implement them as methods:

```javascript
let MyStore = {
  [Action.add](state, record) {
    state.set(record.id, record)
  }
}
```

The first argument of this method will always be the application state
for the particular key the Store is responsible for.
