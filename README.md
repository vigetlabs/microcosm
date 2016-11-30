# [![Microcosm](http://code.viget.com/microcosm/assets/microcosm.svg)](http://code.viget.com/microcosm/)

[![CircleCI](https://img.shields.io/circleci/project/vigetlabs/microcosm.svg?maxAge=2592000)](https://circleci.com/gh/vigetlabs/microcosm)
[![Coveralls](https://img.shields.io/coveralls/vigetlabs/microcosm.svg?maxAge=2592000)](https://coveralls.io/github/vigetlabs/microcosm)
[![npm](https://img.shields.io/npm/v/microcosm.svg?maxAge=2592000)](https://www.npmjs.com/package/microcosm)
[![npm](https://img.shields.io/npm/dm/microcosm.svg?maxAge=2592000)](https://www.npmjs.com/package/microcosm)

Microcosm is [Flux](https://facebook.github.io/flux/) with first-class
actions and state sandboxing.

The source of truth in Microcosm is a historical record of actions. As
they move through a set lifecycle, Microcosm reconciles actions in the
order they were created. This makes optimistic updates, cancellation,
and loading states much simpler. They self clean.

It also provides strong separation between actions and
state. Microcosms can ["fork"](#forks-global-state-local-concerns) to
accommodate specific use cases. Keep global state global, while easily
supporting pagination, filtering, and other secondary data processing.

1. **Batteries included**. Just install `microcosm`. Plugins and middleware
   should not be required to immediately be productive.
2. **Easy to use**. Less boilerplate. More expressive. The Microcosm
   interface is easy to use, easy to understand, and easy to maintain.
3. **Powerful:** Microcosm's transactional state management, action
   statuses, and state sandboxing provide exceptional tools for
   building applications.

## Documentation

Comprehensive documentation can be found in the [docs section of this repo](docs).

If you'd rather look at working code, head over to
the [example apps](examples) or checkout out the [quickstart guide](./docs/guides/quickstart.md).

### Installation

```
npm install --save microcosm
```

## Overview

Microcosm is an evolution of [Flux](https://facebook.github.io/flux/)
that makes it easy to manage complicated async workflows and unique
data modeling requirements of complicated UIs.

### Actions take center stage

Microcosm organizes itself around a history of user actions. As those actions move through a set lifecycle,
Microcosm reconciles them in the order they were created.

Invoking `push()` appends to that history, and returns an `Action` object to represent it:

```javascript
function getPlanet (id) {
  // Fetch returns a Promise, handled out of the box
  return fetch('/planets/' + id).then(response => response.json())
}

let action = repo.push(getPlanet, 'venus')

action.onDone(function (planet) {
  console.log(planet.id) // venus
})
```

### Domains: Stateless Stores

A Domain is a collection of side-effect free operations for manipulating data. As actions update, Microcosm
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

By implementing a register method, domains can subscribe to actions. Each action
is assigned a unique string identifier. **Action type constants are generated automatically**.

### Pending, failed, and cancelled requests

Microcosm makes it easy to handle pending, loading, cancelled,
completed, and failed requests:

```javascript
const PlanetsDomain = {
  // ...handlers

  register() {
    return {
      [getPlanet.open]      : this.setPending,
      [getPlanet.done]      : this.addPlanet,
      [getPlanet.error]     : this.setError,
      [getPlanet.loading]   : this.setProgress,
      [getPlanet.cancelled] : this.setCancelled
    }
  }
}
```

`open`, `loading`, `done`, `error` and `cancelled` are action
states. In our action creator, we can unlock a deeper level of control
by returning a function:

```javascript
import request from 'superagent'

function getPlanet (id) {

  return function (action) {
    action.open(id)

    let request = request('/planets/' + id)

    request.end(function (error, response) {
      if (error) {
        action.reject(error)
      } else {
        action.resolve(response.body)
      }
    })

    // Cancellation!
    action.onCancel(request.abort)
  }
}
```

First, the action becomes `open`. This state is useful when waiting
for something to happen, such as loading. When the request finishes,
if it fails, we reject the action, otherwise we resolve it.

**Microcosm actions are cancellable**. Invoking `action.cancel()` triggers a
cancellation event:

```javascript
let action = repo.push(getPlanet, 'Pluto')

// Wait, Pluto isn't a planet!
action.cancel()
```

When `action.cancel()` is called, the action will move into a
`cancelled` state. If a domain doesn't handle a given state no data
operation will occur.

Visit [the API documentation for actions](./docs/api/actions.md) to
read more.

### A historical account of everything that has happened

Whenever an action creator is pushed into a Microcosm, it creates an
action to represent it. This gets placed into a tree of all actions
that have occurred.

For performance, completed actions are archived and purged from
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

**Microcosm will never clean up an action that precedes incomplete
work** When an action moves from `open` to `done`, or `cancelled`, the
historical account of actions rolls back to the last state, rolling
forward with the new action states. This makes optimistic updates a
sync because action states are self cleaning:

```javascript
import {send} from 'actions/chat'

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
      [action.open]  : this.setPending,
      [action.error] : this.setError,
      [action.done]  : this.addMessage
    }
  }
}
```

In this example, as chat messages are sent, we optimistically update
state with the pending message. At this point, the action is in an
`open` state. The request has not finished.

On completion, when the action moves into `error` or `done`, Microcosm
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

`fork` returns a new Microcosm, however it shares the same action
history. Additionally, it inherits state updates from its
parent. In this example, we've added special version of the `roster`
repo that only keeps track of the current page.

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

  model () {
    return {
      page: state => state.users
    }
  }

  view ({ page }) {
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

---

<a href="http://code.viget.com">
  <img src="http://code.viget.com/github-banner.png" alt="Code At Viget">
</a>

Visit [code.viget.com](http://code.viget.com) to see more projects from [Viget.](https://viget.com)
