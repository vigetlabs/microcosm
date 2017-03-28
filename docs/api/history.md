# History

1. [Overview](#overview)
2. [API](#api)

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

```
let repo = new Microcosm({ maxHistory: Infinity })

let one = repo.push(addUser)
let two = repo.push(updateUser)

repo.history.toggle([ one, two ])
```

In the example above, actions `one` and `two` will be forgotten. The
repo's history will reconcile, and it will be as if they never
existed.

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

repo.wait().then(function () {
  // Everything is done
})
```

### then(resolve, reject)

Allows for direct Promise interop with history. One common use case
for this is to wait for all actions to complete before executing a
test. For example, if we were to write a test with Jest:

```javascript
describe('An AJAX behavior', function() {

  it('adds a user', async function () {
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
