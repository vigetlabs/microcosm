# [![Microcosm](http://code.viget.com/microcosm/assets/microcosm.svg)](http://code.viget.com/microcosm/)

[![CircleCI](https://img.shields.io/circleci/project/vigetlabs/microcosm.svg?maxAge=2592000)](https://circleci.com/gh/vigetlabs/microcosm)
[![Codecov branch](https://img.shields.io/codecov/c/github/vigetlabs/microcosm/master.svg)](https://coveralls.io/github/vigetlabs/microcosm)
[![npm](https://img.shields.io/npm/v/microcosm.svg?maxAge=2592000)](https://www.npmjs.com/package/microcosm)
[![npm](https://img.shields.io/npm/dm/microcosm.svg?maxAge=2592000)](https://www.npmjs.com/package/microcosm)

Microcosm is a state management tool for [React](https://github.com/facebook/react) (and similar libraries). Keep track of user actions, cancel requests, and perform optimistic updates with ease.

## At a glance

```javascript
import Microcosm, { get, set } from 'microcosm'

let repo = new Microcosm()

function getUser (id) {
  // This will return a promise. Microcosm automatically understands promises,
  // see http://code.viget.com/microcosm/api/tasks.html
  return fetch(`/users/#{id}`).then(response => response.json())
}

// Domains define how a Microcosm should turn tasks into new state
repo.addDomain('users', {
  getInitialState () {
    return {}
  },
  addUser (users, record) {
    // The set helper non-destructively assigns keys to an object
    return set(users, record.id, record)
  },
  register () {
    return {
      [getUser.done]: this.addUser
    }
  }
})

// Create a task, a request to perform some kind of work
let task = repo.push(getUser, 2)

task.onDone(function () {
  let user = get(repo.state, ['users', '2'])

  console.log(user) // { id: 2, name: "Bob" }
})

// You could also handle errors in a domain's register method
// by hooking into `getUser.error`
task.onError(function () {
  alert("Something went terribly wrong!")
})
```

## Why?

Other [Flux](https://facebook.github.io/flux/) implementations treat
actions as static events; the result of calling a dispatch method or
resolving some sort of data structure like a Promise.

But what if a user gets tired of waiting for a file to upload, or
switches pages before a GET request finishes? What if they dip into a
subway tunnel and lose connectivity? They might want to retry a
request, cancel it, or just see what’s happening.

The burden of this state often falls on data stores (Domains, in
Microcosm) or a home-grown solution for tracking outstanding requests
and binding them to related action data. Presentation layer
requirements leak into the data layer, making it harder to write
tests, reuse code, and accommodate unexpected changes.

### How Microcosm is different

Microcosm actions are first-class citizens. Each dispatched action
gets a unique task to represent it. This task can move from an `open`
to `error` state if a request fails. Requests that are aborted may
move into a `cancelled` state. As they change, tasks operate within a
greater history.

This means that applications can make a lot of assumptions about user actions:

- Tasks resolve in a consistent, predictable order
- Task types are automatically generated based on their associated action
- Tasks maintain the same public API, no matter what asynchronous
  pattern is used inside of an action (or otherwise)

This reduces a lot of boilerplate, however it also makes it easier for the presentation layer to handle use-case specific display requirements, like displaying an error, performing an optimistic update, or tracking file upload progress.

## Get started

```
npm install --save microcosm
```

Check out our [quickstart guide](http://code.viget.com/microcosm/guides/quickstart.html).

## Documentation

Comprehensive documentation can be found in the [docs section of this repo](docs).

## Overview

Microcosm is an evolution of [Flux](https://facebook.github.io/flux/)
that makes it easy to manage complicated async workflows and unique
data modeling requirements of complicated UIs.

### Actions take center stage

Microcosm organizes itself around a history of user actions. Each
dispatched action gets an associated Task to represent it. As this
task executes the action, Microcosm reconciles changes to that task's
state within a greater history

Invoking `push()` appends to that history, creating a `Task` object
for the associated action:

```javascript
function getPlanet (id) {
  // Fetch returns a Promise, handled out of the box
  return fetch('/planets/' + id).then(response => response.json())
}

let task = repo.push(getPlanet, 'venus')

task.onDone(function (planet) {
  console.log(planet.id) // venus
})
```

### Domains: Stateless Stores

A Domain is a collection of side-effect free operations for manipulating data. As tasks update, Microcosm
uses domains to determine how state should change. Old state comes in, new state comes out:

```javascript
const PlanetsDomain = {
  getInitialState () {
    return []
  },

  addPlanet (planets, record) {
    return planets.concat(record)
  },

  register() {
    return {
      [getPlanet]: this.addPlanet
    }
  }
}

repo.addDomain('planets', PlanetsDomain)
```

By implementing a register method, domains can subscribe to action
statuses. Each action is assigned a unique string identifier. **Action
type constants are generated automatically**.

### Pending, failed, and cancelled requests

Microcosm makes it easy to handle pending, loading, cancelled,
completed, and failed requests:

```javascript
const PlanetsDomain = {
  // ...handlers

  register() {
    return {
      [getPlanet] : {
        open   : this.setPending,
        update : this.setProgress,
        done   : this.addPlanet,
        error  : this.setError,
        cancel : this.setCancelled
      }
    }
  }
}
```

`open`, `loading`, `done`, `error` and `cancelled` are action
states. In our action, we can operate directly on the Task object
created for it by returning a function:

```javascript
import request from 'superagent'

function getPlanet (id) {

  return function (task) {
    task.open(id)

    let request = request('/planets/' + id)

    request.end(function (error, response) {
      if (error) {
        task.reject(error)
      } else {
        task.resolve(response.body)
      }
    })

    // Cancellation!
    task.onCancel(request.abort)
  }
}
```

First, the task becomes `open`. This state is useful when waiting
for something to happen, such as loading. When the request finishes,
if it fails, we reject the task, otherwise we resolve it.

**Microcosm tasks are cancellable**. Invoking `task.cancel()` triggers a
cancellation event:

```javascript
let task = repo.push(getPlanet, 'Pluto')

// Wait, Pluto isn't a planet!
task.cancel()
```

When `task.cancel()` is called, the task will move into a
`cancelled` state. If a domain doesn't handle a given state no data
operation will occur.

Visit [the API documentation for tasks](./docs/api/tasks.md) to
read more.

### A historical account of everything that has happened

Whenever an action is dispatched in Microcosm, it creates task to
represent it. This gets placed into a history of all previous tasks.

For performance, completed tasks are archived and purged from
memory, however passing the `maxHistory` option into Microcosm allows
for a compelling debugging story, For example, [the time-travelling
Microcosm debugger](https://github.com/vigetlabs/microcosm-debugger):

```javascript
let forever = new Microcosm({ maxHistory: Infinity })
```

<a href="https://github.com/vigetlabs/microcosm-debugger" style="display: block">
  <img style="display: block; margin: 0 auto;" src="https://github.com/vigetlabs/microcosm-debugger/raw/master/docs/chat-debugger.gif" alt="Microcosm Debugger" width="600" />
</a>

Taken from [the Chatbot example](https://github.com/vigetlabs/microcosm/tree/master/examples/chatbot).

#### Optimistic updates

**Microcosm will never clean up a task that precedes incomplete
work** When an task moves from `open` to `done`, or `cancelled`, the
historical account of tasks rolls back to the last state, rolling
forward with the new state. This makes optimistic updates simpler
because handlers that operate on pending states self clean:

```javascript
import { send } from 'actions/chat'

const Messages = {
  getInitialState () {
    return []
  },

  setPending(messages, item) {
    return messages.concat({ ...item, pending: true })
  },

  setError(messages, item) {
    return messages.concat({ ...item, error: true })
  },

  addMessage(messages, item) {
    return messages.concat(item)
  }

  register () {
    return {
      [send]: {
        open  : this.setPending,
        error : this.setError,
        done  : this.addMessage
      }
    }
  }
}
```

In this example, as chat messages are sent, we optimistically update
state with the pending message. At this point, the task is in an
`open` state. The request has not finished.

On completion, when the task moves into `error` or `done`, Microcosm
recalculates state starting from the point _prior_ to the `open` state
update. The message stops being in a loading state because, as far as
Microcosm is now concerned, _it never occured_.

### Forks: Global state, local concerns

Global state management reduces the complexity of change propagation
tremendously. However it can make application features such as
pagination, sorting, and filtering cumbersome.

How do we maintain the current page we are on while keeping in sync
with the total pool of known records?

To accommodate this use case, there is `Microcosm::fork`:

```javascript
const UsersDomain = {
  getInitialState() {
    return []
  },
  addUsers(users, next) {
    return users.concat(next)
  },
  register() {
    return {
      [getUsers]: this.addUsers
    }
  }
})

const PaginatedUsersDomain {
  getInitialState() {
    return []
  },
  addUsers(users, next) {
    let page = next.map(user => user.id)

    // Reduce the user list down to only what was included
    // in the current request
    return users.filter(user => page.contains(user.id))
  },
  register() {
    return {
      [getUsers]: this.addUsers
    }
  }
})

let roster = new Microcosm()
let pagination = parent.fork()

roster.addDomain('users', UsersDomain)
pagination.addDomain('users', PaginatedUsersDomain)

// Forks share the same history, so you could also do
// `pagination.push(getUsers, ...)`
roster.push(getUsers, { page: 1 }) // 10 users
roster.push(getUsers, { page: 2 }) // 10 users

// when it finishes...
console.log(roster.state.users.length) // 20
console.log(pagination.state.users.length) // 10
```

`fork` returns a new Microcosm, however it shares the same
history. Additionally, it inherits state updates from its parent. In
this example, we've added special version of the `roster` repo that
only keeps track of the current page.

As `getUsers()` is called, the `roster` will add the new users to the
total pool of records. Forks dispatch sequentially, so the child
`pagination` repo is able to filter the data set down to only what it
needs.

### Networks of Microcosms with Presenters

Fork is an important component of
the [`Presenter` addon](./docs/api/presenter.md). Presenter is a
special React component that can build a view model around a given
Microcosm state, sending it to child "passive view" components.

All Microcosms sent into a Presenter are forked, granting them a sandbox
for data operations specific to a particular part of an application:

```javascript
class PaginatedUsers extends Presenter {
  setup (repo, { page }) {
    repo.add('users', PaginatedUsersDomain)

    repo.push(getUsers, page)
  }

  getModel () {
    return {
      page: state => state.users
    }
  }

  render () {
    const { page } = this.model

    return <UsersTable users={page} />
  }
}

const repo = new Microcosm()
repo.addDomain('users', UsersDomain)

ReactDOM.render(<PaginatedUsers repo={repo} page="1" />, el)
```

## Inspiration

- [Worlds](http://www.vpri.org/pdf/rn2008001_worlds.pdf)
- [Om](https://github.com/omcljs/om)
- [Elm Language](https://elm-lang.org)
- [Flummox](https://github.com/acdlite/flummox)
- [But the world is mutable](http://www.lispcast.com/the-world-is-mutable)
- [Event Sourcing Pattern](http://martinfowler.com/eaaDev/EventSourcing.html)
- [Apache Kafka](http://kafka.apache.org/)
- [LMAX Architecture](http://martinfowler.com/articles/lmax.html)
- [Redux](https://github.com/reactjs/redux) (Provider/Connect and thunks)
- [Retroactive Data Structures](https://en.wikipedia.org/wiki/Retroactive_data_structures)

---

<a href="http://code.viget.com">
  <img src="http://code.viget.com/github-banner.png" alt="Code At Viget">
</a>

Visit [code.viget.com](http://code.viget.com) to see more projects from [Viget.](https://viget.com)
