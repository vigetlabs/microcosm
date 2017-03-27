# Tasks

1. [Overview](#overview)
2. [Writing actions](#writing-actions)
3. [Dispatching to Domains](#dispatching-to-domains)
4. [How this works](#how-this-works)
5. [API](#api)

## Overview

Microcosm uses actions to queue up some task and track its
progress. Actions are ultimately dispatched to domains and effects for
additional processing. Use actions to send requests to a server, or
dispatch a global notification that some user action has occurred.

Create an action by executing `Microcosm::push` with a function that
performs some type of work. We call this function an _action creator_.

```javascript
const repo = new Microcosm()

function createPlanet (data) {
  let request = fetch('/planets', { method: 'POST', data })

  // This will return a promise, which Microcosm automatically
  // understands. Read further for more details.
  return request.then(response => response.json())
}

const action = repo.push(createPlanet, { name: 'Venus' })

action.onDone(function () {
  // All done!
})
```

An action moves through several states:

1. `open`: Indicates work has started.
2. `loading`: Used for progress updates.
3. `done`: The action has completed successfully.
4. `error`: The action has failed.
5. `cancelled`: Useful tracking aborted XHR requests or closed dialog modals.

You can access these states with varying degrees of control depending
on how you author action creators.

## Writing actions

Tasks execute actions. There are three ways to write actions in
Microcosm, all of which relate to the value returned from functions
passed into `repo.push()`.

### Return a primitive value

Actions that return a primitive value resolve immediately:

```javascript
function addPlanet (props) {
  return props
}

repo.push(addPlanet, { name: 'Saturn' })
```

### Return a promise

```javascript
function readPlanets () {
  // Using your favorite promise-based ajax library (maybe axios or fetch?)
  return ajax.get('/planets')
}

repo.push(readPlanets)
```

### Return a function

Actions that return functions grant full access to the task that
executed it. If we were to write a lower level version of the Promise
example earlier:

```javascript
function readPlanets () {
  return function (task) {
    task.open()

    const xhr = new XMLHttpRequest()

    xhr.open('GET', '/planets')
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.addEventListener('load', function () {
      task.resolve(JSON.parse(xhr.responseText))
    })

    xhr.addEventListener('error', function () {
      task.reject({ status: xhr.status })
    })

    xhr.send()
  }
}

repo.push(readPlanets)
```

## Dispatching to Domains

One of the differences between Microcosm and other Flux
implementations is the dispatch process. Sending tasks to domains is
handled by Microcosm. Instead of dispatching `ACTION_LOADING` or
`ACTION_FAILED`, tasks go through various states as they resolve,
using their associated action as an identity for the type of work
done. You can subscribe to these states within domains like:

```javascript
// A sample domain that subscribes to every action state
const SolarSystem = {

  // ... Other domain methods

  register() {
    return {
      [getPlanet.open]      : this.setLoading,
      [getPlanet.loading]   : this.setProgress,
      [getPlanet.done]      : this.addPlanet,
      [getPlanet.error]     : this.setError,
      [getPlanet.cancelled] : this.setCancelled
    }
  }
}
```

## How this works

Whenever `repo.push(action)` is invoked, Microcosm creates a new
`Task` object, appending it to a history of all tasks. As this task
moves through different states, this history will run through all
outstanding tasks to determine the next state.

By default, Microcosm only holds onto unresolved tasks. This can be
extended by setting the `maxHistory` setting when creating a
Microcosm:

```javascript
const repo = new Microcosm({ maxHistory: 100 })
```

This is useful for debugging purposes, or to implement undo/redo
behavior.

## API

### `onDone(callback, [scope])`

Add a one-time event subscription for when the task resolves
successfully. If the task is already resolved, it will immediately
execute.

### `onError(callback, [scope])`

Add a one-time event subscription for when the task is rejected. If
the task has already failed, it will immediately execute.

### `onUpdate(callback, [scope])`

Listen for progress updates from an task as it loads. For example:

```javascript
function wait () {

  return function (task) {
    task.open()
    setTimeout(() => task.update(25), 500)
    setTimeout(() => task.update(50), 1000)
    setTimeout(() => task.update(75), 1500)
    setTimeout(() => task.resolve(100), 1000)
  }
}

repo.push(wait).onUpdate(function (payload) {
  console.log(payload) // 25...50...75
})
```

An important note here is that `onUpdate` does not trigger when an
task completes.

### `onCancel(callback, [scope])`

Add a one-time event subscription for when the task is cancelled. If
the task has already been cancelled, it will immediately execute.

### `then(resolve, reject)`

Return a promisified version of the task. This is useful for interop
with `async/await`, or working with testing tools like `ava` or
`mocha`.

```javascript
const result = await repo.push(promiseAction)

// or
repo.push(promiseAction).then(success, failure)
```

### `open([payload])`

Elevate a task into the `open` state and optional update the
payload. Domains registered to `action.open` will pick up on an action
within this state.

### `update([payload])`

Send a progress update. This will move a task into the `loading`
state and optional update the payload. Domains registered to
`action.loading` will pick up on a task within this state.

### `reject([payload])`

Reject a task. This will move an task into the `error` state and
optional update the payload. Domains registered to `action.error` will
pick up on an task within this state.

### `resolve([payload])`

Resolve a task. This will move a task into the `done` state and
optional update the payload. Domains registered to `action` or `action.done`
will pick up on a task within this state.

### `cancel()`

Cancel an task. This is useful for handling cases such as aborting
ajax requests. Moves an task into the `cancelled`. Domains registered
to `action.cancelled` will pick up on a task within this state.
