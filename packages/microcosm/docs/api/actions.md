# Actions

1. [Overview](#overview)
2. [Writing Action Creators](#writing-action-creators)
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
// axios is an AJAX library
// https://github.com/mzabriskie/axios
import axios from 'axios'

const repo = new Microcosm()

function createPlanet (data) {
  // This will return a promise, which Microcosm automatically
  // understands. Read further for more details.
  return axios.post('/planets', data)
}

const action = repo.push(createPlanet, { name: 'Venus' })

action.onDone(function () {
  console.log('All done!')
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

## Writing Action Creators

There are four ways to write action creators in Microcosm, all of
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

```javascript
import axios from 'axios'

function getPlanet (id) {
  // Any promise-based AJAX library will do. We like axios
  return axios(`/planets/${id}`)
}

repo.push(getPlanet, 'mars')
```

When returning a Promise:

1. The action is opened with the first argument of the parameters
   passed to `repo.push`. In this case: `'mars'`
2. When the request finishes, the action is resolved with the payload
   passed into the Promise's resolve callback
3. If the request fails, the action is rejected with whatever error
   was passed with the Promise's reject callback

### Return a function

Action creators that return functions grant full access to the action
that represents it. If we were to write a lower level version of the Promise
example earlier:

```javascript
function readPlanets () {
  return function (action) {
    action.open()

    const xhr = new XMLHttpRequest()

    xhr.open('GET', '/planets')
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.addEventListener('load', function () {
      action.resolve(JSON.parse(xhr.responseText))
    })

    xhr.addEventListener('error', function () {
      action.reject({ status: xhr.status })
    })

    xhr.send()
  }
}

repo.push(readPlanets)
```

**Heads up:** Sometimes you want an action to return a function that isn't 
executed as a thunk. If you pass a function as an action argument and return 
that function in the action body, Microcosm _will not_ treat this as a thunk.

```javascript
function noThunk(fn) {
  return fn // will not be called as a thunk by Microcosm
}
```

If you need to return a function from an action body consider wrapping it in a 
thunk:

```javascript
function actionReturnsFunction () {
  return function (action) {
    action.resolve(x => x) // the action's payload will be this inner function
  }
}
```

Alternatively, if you want Microcosm to treat your function action argument as 
a thunk, you can wrap it in an anonymous function first.

```javascript
function maybeThunk(thunkFn, shouldThunk) {
  if (shouldThunk) {
    return (action, repo) => thunkFn(action, repo)
  }
}
```

### Return a generator

**Heads up:** Generators are a new feature included in the JS2015
language specification, which does not have wide support. To get
around this, we recommend using [Babel](https://babeljs.io) with
the [regenerator](https://github.com/facebook/regenerator) polyfill
available
through [babel-polyfill](https://babeljs.io/docs/usage/polyfill/).

Often times we need to dispatch multiple actions in sequential
order. For example, what if we want to ask the user to confirm their
action before deleting a record?

This can be accomplished by using a generator:

```javascript
function ask (message) {
  return action => {
    if (confirm(message)) {
      action.resolve()
    } else {
      action.reject()
    }
  }
}

function deleteUser (id) {
  return axios.delete('/users/${id}')
}

function confirmAndDelete (user) {
  return function * (repo) {
    yield repo.push(ask, `Are you sure you want to delete ${user.name}?`)
    yield repo.push(deleteUser, user.id)
  }
}
```

Each `yield` in the generator processes sequentially. A parent action
is returned from `repo.push()` to represent the entire sequence. If
any action is cancelled or rejected along the way, the parent action
is rejected or cancelled with the same payload.

When all steps of the generator complete, the payload of the parent
action will be the resolved payload of the final action.

#### Yielding Actions in Parallel

By yielding an array of actions, you can wait for multiple actions to
complete before continuing:

```javascript
function getUser (id) {
  return fetch(`/users/${id}`)
}

function getUsers (ids) {
  return function * (repo) {
    yield ids.map(id => repo.push(getUser, id))
  }
}

repo.push(getUsers, [ 1, 2 ])
```

Alternatively, you may also yield an object, this is useful for stitching together records that may have data at different locations:

```javascript
function getPost (id) {
  return fetch(`/posts/${id}`)
}

function getComments (id) {
  return fetch(`/posts/${id}/comments`)
}

function getPostWithComments (id) {
  return function * (repo) {
    let { post, comments } = yield {
      post: repo.push(getPost, id),
      comments: repo.push(getComments, id)
    }
    
    post.comments = comments

    return post
  }
}

repo.push(getBlogPost, 1)
```

If all actions resolve or cancel, the generator sequence continues.

### Action status methods are auto-bound

Action status methods like `action.resolve()` and `action.reject()`
are auto-bound. They can be passed directly into a callback without
needing to wrap them in an anonymous function.

This is particularly useful when working with AJAX libraries. For
example, when working with `superagent`:

```javascript
import superagent from 'superagent'

function getPlanets () {
  return action => {
    let request = superagent.get('/planets')

    request.on('request', action.open)
    request.on('progress', action.update)
    request.on('abort', action.cancel)

    request.then(action.resolve, action.reject)
  }
}
```

## Dispatching to Domains

One of the differences between Microcosm and other Flux
implementations is the dispatch process. Sending actions to domains is
handled by Microcosm. Instead of dispatching `ACTION_LOADING` or
`ACTION_FAILED`, actions go through various states as they
resolve. You can subscribe to these states within domains like:

```javascript
// A sample domain that subscribes to every action state
const SolarSystem = {

  // ... Other domain methods

  register() {
    return {
      [getPlanet]: {
        open   : this.setLoading,
        update : this.setProgress,
        done   : this.addPlanet,
        error  : this.setError,
        cancel : this.setCancelled
      }
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
    setTimeout(() => action.update(25), 500)
    setTimeout(() => action.update(50), 1000)
    setTimeout(() => action.update(75), 1500)
    setTimeout(() => action.resolve(100), 1000)
  }
}

repo.push(wait).onUpdate(function (payload) {
  console.log(payload) // 25...50...75
})
```

An important note here is that `onUpdate` does not trigger when an
action completes.

### `onCancel(callback, [scope])`

Add a one-time event subscription for when the action is cancelled. If
the action has already been cancelled, it will immediately execute.

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
payload. Domains registered to `action.open` will pick up on an action
within this state.

### `update([payload])`

Send a progress update. This will move an action into the `loading`
state and optional update the payload. Domains registered to
`action.loading` will pick up on an action within this state.

### `reject([payload])`

Reject an action. This will move an action into the `error` state and
optional update the payload. Domains registered to `action.error` will
pick up on an action within this state.

### `resolve([payload])`

Resolve an action. This will move an action into the `done` state and
optional update the payload. Domains registered to `action` or `action.done`
will pick up on an action within this state.

### `cancel()`

Cancel an action. This is useful for handling cases such as aborting
ajax requests. Moves an action into the `cancelled`. Domains registered
to `action.cancelled` will pick up on an action within this state.
