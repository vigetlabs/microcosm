# Microcosm

1. [Overview](#overview)
2. [API](#api)
3. [Listening to Changes](#listening-to-changes)
4. [Running an instance](#running-an-instance)

## Overview

Microcosm is a flavor of Flux specifically designed to address the
problem of state isolation. More specifically, these are the problems
it sets out to solve:

1. Complete separation of state between instances of Microcosm without
being bogged down by unique instances of Stores and Actions.
2. Small enough for library use.
3. Keep state in one place. Stores should _transform_ data, not keep
   it.

## Listening to changes

```javascript
let app = new Microcosm()

// Add a callback
app.listen(callback)

// Remove a callback
app.ignore(callback)

// Force an emission
app.emit()
```

## Running an instance

`Microcosm::start` begins an application. This will setup initial
state, run plugins, then execute a callback:

```
let app = new Microcosm()

app.start(function() {
  // Now do something
})
```
