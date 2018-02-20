# History

1. [Overview](#overview)
2. [API](#api)
3. [Events](#events)

**Note: This is a work in progress document and feature. History has
been a private API for a very long time. We're still working through
the best public interface for working with Microcosm's action
history.**

## Overview

All Microcosms have a history. This history keeps track of outstanding
actions, working with a Microcosm to determine the next application
state as actions move through different states.

By default, Microcosm automatically disposes actions that are
complete. However you can control how many actions Microcosm's history
will hold on to by passing the `maxHistory` option:

```javascript
// Hold onto the last 10 actions
let repo = new Microcosm({ maxHistory: 10 })

// Or never forget anything
let repo = new Microcosm({ maxHistory: Infinity })

// Then push some actions
repo.push(action)
repo.push(action)
repo.push(action)

// Get actions out by using `repo.history.toArray()`
let actions = repo.history.toArray() // [actionOne, actionTwo, actionThree]
```

### The data structure

History stores actions as a tree, with a root and a head:

```
[root] - [one] - [two] - [three]
```

You can revert to a prior action by using `checkout(action)`:

```javascript
let repo = new Microcosm({ maxHistory: Infinity })

let one = repo.push(action)
let two = repo.push(action)

repo.history.checkout(one)

let three = repo.push(action)
```

In the example above, the following tree would be produced:

```
               |- [two]
[root] - [one] +
               |- [*three]
```

`three` is the active branch, marked with an asterisk. The active
branch is used to determine state. Here, a Microcosm's state will be
the result of dispatching `root`, `one`, and `three` to Domains.

### Reconciling

What makes History such a powerful feature of Microcosm is its
ability to walk through recorded actions whenever there is a change,
similar to a rebase in git.

Let's say we have four actions pushed to our History, and that three
of the four are completed `(C)`, but the second action we pushed is
taking a long time and is still open `(O)`.

```
[root] - [one](C) - [two](O) - [three](C) - [four](C)
```

When our `two` action here resolves or rejects, History will initiate
a reconciliation starting at `two`, and walk forward to `three` and
then `four`. At each step, your Domains will recompute changes to the
state based on the actions.

This ensures that your application state is always accurate based on
the order in which actions were triggered.

## API

### checkout(action)

Set the head of the tree to a target action. This has the effect
of controlling time in a Microcosm's history:

```javascript
let repo = new Microcosm({ maxHistory: Infinity })

let one = repo.push(action)
let two = repo.push(action)

repo.history.checkout(one)

let three = repo.push(action)
```

The head of the history tree above is now three. Microcosm will
calculate state by reconciling `root`, `one,` and `three`.

### toggle([ ...actions ])

Disable a group of actions:

```javascript
let repo = new Microcosm({ maxHistory: Infinity })

let one = repo.push(addUser)
let two = repo.push(updateUser)

repo.history.toggle([one, two])
```

In the example above, actions `one` and `two` will be forgotten. The
repo's history will reconcile, and it will be as if they never
existed.

This flips the `disabled` state of each action provided. By executing
toggle a second time, these actions will be re-enabled:

```javascript
// Actions disabled in the prior example
repo.history.toggle([one, two])
// `one` and `two` have been re-enabled
```

### toArray()

Return an array version of the active branch:

```javascript
let repo = new Microcosm({ maxHistory: Infinity })

let one = repo.push(action)
let two = repo.push(action)

repo.history.checkout(one)

let three = repo.push(action)

repo.toArray() // => [ root, one, three ]
```

### wait()

Return a Promise that waits for all current actions to complete. If
any action rejects, this promise will reject. **cancellation is
ignored. Cancelling an action will not reject this promise.**

```javascript
let repo = new Microcosm({ maxHistory: Infinity })

let one = repo.push(asyncAction)
let two = repo.push(asyncAction)
let three = repo.push(asyncAction)

repo.wait().then(function() {
  // Everything is done
})
```

### then(resolve, reject)

Allows for direct Promise interop with history. One common use case
for this is to wait for all actions to complete before executing a
test. For example, if we were to write a test with Jest:

```javascript
describe('An AJAX behavior', function() {
  it('adds a user', async function() {
    let repo = new MyMicrocosm({ maxHistory: Infinity })

    repo.push(getUser, 1)
    repo.push(getUser, 2)
    repo.push(getUser, 3)

    await repo.history

    expect(repo.users.length).toEqual(3)
  })
})
```

### remove(action)

Completely remove an action from history. This is a dangerous
operation! Removed actions can never be re-inserted.

```javascript
let repo = new MyMicrocosm({ maxHistory: Infinity })

let one = repo.push(action)
let two = repo.push(action)
let three = repo.push(action)

repo.history.remove(two)

repo.history.toArray() // [root, one, three]
```

## Events

History emits events any time something of interest happens. This is
how Microcosm knows to update the state to accurately reflect what's
going on given a sequence of actions and their statuses.

You can manage event listeners with the following methods.

### `on(event, callback)`

Adds an event listener to a Microcosm History instance.

```javascript
const repo = new Microcosm()
const history = repo.history

history.on('append', callback)
```

### `off(event, callback)`

Removes an event listener.

```javascript
history.off('append', callback)
```

### Event Types

### `append`

Arguments: `action`

Emitted when an action is pushed onto the History stack.

```javascript
history.on('append', function(action) {
  console.log('Action pushed:', action.id)
})

repo.push(newAction)

// Action pushed: 42
```

### `remove`

Arguments: `action`

Emitted when an action is removed from the History stack.

```javascript
history.on('remove', function(action) {
  console.log('Action removed:', action.id)
})

action = repo.push(newAction)
history.remove(action)

// Action removed: 42
```

### `update`

Arguments: `action`

Whenever there is an update to an action's status, an `update` event
is emitted with that action.

```javascript
history.on('update', function(action) {
  console.log('Action status:', action.status)
})

repo.push(newAction)

// Action status: inactive
// Action status: open
// Action status: update
// Action status: [resolve, reject, cancel]
```

Whenever an action that precedes other actions has a status update,
History walks forward in time from that action reconciling the
application state (see [Reconciling](#reconciling) for more details.)
For every action in this process, `update` will be emitted.

### `reconcile`

Arguments: `action`

In response to an action's status changing, History triggers a
reconciliation. Once that has completed (and an `update` event has
been emitted for each reconciled action), `reconcile` is emitted with
the action that triggered the walk through.

```javascript
history.on('reconcile', function(action) {
  console.log('Action:', action.id)
})

repo.push(newAction)

// Action: 42
```

### `release`

Emitted after a reconciliation pass. In setting up a Microcosm, you
have the option to pass a `batch` option which will cause `release`
to be emitted in batched intervals (used internally to improve state
comparison performance).

```javascript
let repo = new Microcosm({ batch: true })
let history = repo.history

history.on('append', function(action) {
  console.log('Action:', action.id)
})
history.on('release', function() {
  console.log('Released!')
})

repo.push(newAction)
repo.push(newAction)
repo.push(newAction)

// Action: 1
// Action: 2
// Action: 3
// Released!
```
