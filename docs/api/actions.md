# Actions

1. [Overview](#overview)
2. [Writing action creators](#writing-action-creators)
3. [Dispatching to Stores](#dispatching-to-stores)
4. [How this works](#how-this-works)
5. [API](#api)

## Overview

Actions encapsulate the process of resolving an action creator. For
most purposes, they should never be created on their own. Use `push()`
within a Microcosm instance so that it can be tracked within its
internal state:

```javascript
const action = repo.push(createPlanet, { name: 'Venus' })

action.onDone(function () {
  // All done!
})
```

## Writing Action Creators

There are three ways to write action creators in Microcosm, all of
which relate to the value returned from functions passed into `repo.push()`.

### Return a primitive value

Action creators that return a primitive value resolve immediately:

```javascript
function addPlanet (props) {
  return props
}

repo.push(addPlanet, { name: 'Saturn' })
```

### Return a promise

Action creators that return a promise move through several states:

1. `open`: The action is opened immediately. This allows stores to
   handle a loading state.
2. `done`: The action completes when the Promise resolves
3. `failed`: The action fails when the Promise is rejected

```javascript
function readPlanets () {
  // Using your favorite promise-based ajax library (maybe axios or fetch?)
  return ajax.get('/planets')
}

repo.push(readPlanets)
```

### Return a function

Action creators that return functions grant full access to the action
that represents it. If we were to a vanilla version of the Promise
example earlier:

```javascript
function readPlanets () {
  return function (action) {
    action.open()

    const xhr = new XMLHttpRequest()

    xhr.open('GET', '/planets')
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.addEventListener('load', function () {
      action.close(JSON.parse(xhr.responseText))
    })

    xhr.addEventListener('error', function () {
      action.reject({ status: xhr.status })
    })

    xhr.send()
  }
}

repo.push(readPlanets)
```

## Dispatching to Stores

One of the differences between Microcosm and other Flux
implementations is the dispatch process. Sending actions to stores is
handled by Microcosm. Instead of dispatching `ACTION_LOADING` or
`ACTION_FAILED`, actions go through various states as they
resolve. You can subscribe to these states within stores like:

```javascript
// A sample store that subscribes to every action state
const SolarSystem = {

  // ... Other store methods

  register() {
    return {
      [getPlanet.open]      : this.setLoading,
      [getPlanet.loading]   : this.setProgress,
      [getPlanet.done]      : this.addPlanet,
      [getPlanet.failed]    : this.setError,
      [getPlanet.cancelled] : this.setCancelled
    }
  }
}
```

## How this works

Whenever `repo.push()` is invoked, Microcosm creates a new `Action`
object, appending it to a ledger of all actions. As the state of an
action changes, the associated microcosm will run through all
outstanding actions to determine the next state.

By default, Microcosm will only hold on to unresolved actions. This
can be extended by setting the `maxHistory` setting when creating a Microcosm:

```javascript
const repo = new Microcosm({ maxHistory: 100 })
```

This is useful for debugging purposes, or to implement undo/redo
behavior.

## API

### `onDone(callback, [scope])`

Add a one-time event subscription for when the action resolves
successfully. If the action is already resolved, it will immediately
execute.

### `onError(callback, [scope])`

Add a one-time event subscription for when the action is rejected. If
the action has already failed, it will immediately execute.

### `onUpdate(callback, [scope])`

Listen for progress updates from an action as it loads. For example:

```javascript
function wait () {

  return function (action) {
    action.open()
    setTimeout(() => action.send(25), 500)
    setTimeout(() => action.send(50), 1000)
    setTimeout(() => action.send(75), 1500)
    setTimeout(() => action.close(100), 1000)
  }
}

repo.push(wait).onUpdate(function (payload) {
  console.log(payload) // 25...50...75
})
```

An important note here is that `onUpdate` does not trigger when an
action completes.

### `then(resolve, reject)`

Return a promisified version of the action. This is useful for interop
with `async/await`, or working with testing tools like `ava` or
`mocha`.

```javascript
const result = await repo.push(promiseAction)

// or
repo.push(promiseAction).then(success, failure)
```

### `open([payload])`

Elevate an action into the `open` state and optional update the
payload. Stores registered to `action.open` will pick up on an action
within this state.

### `send([payload])`

Send a progress update. This will move an action into the `loading`
state and optional update the payload. Stores registered to
`action.loading` will pick up on an action within this state.

### `reject([payload])`

Reject an action. This will move an action into the `failed` state and
optional update the payload. Stores registered to `action.failed` will
pick up on an action within this state.

### `close([payload])`

Resolve an action. This will move an action into the `done` state and
optional update the payload. Stores registered to `action` or `action.done`
will pick up on an action within this state.

### `cancel()`

Cancel an action. This is useful for handling cases such as aborting
ajax requests. Moves an action into the `cancelled`. Stores registered
to `action.cancelled` will pick up on an action within this state.
