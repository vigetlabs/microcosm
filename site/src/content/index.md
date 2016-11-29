---
layout: home
---

## Actions

Microcosm organizes itself around a history of user actions. As those
actions move through a set lifecycle, Microcosm reconciles them in the
order they were created.

Invoking `push()` appends to that history, and returns an `Action`
object to represent it:

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

## Domains: Stateless Stores

A Domain is a collection of side-effect free operations for manipulating
data. As actions update, Microcosm uses domains to determine how state
should change. Old state comes in, new state comes out:

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

By implementing a register method, domains can subscribe to actions.
Each action is assigned a unique string identifier. **Action type
constants are generated automatically**.

## Pending, failed, and cancelled requests

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

`open`, `loading`, `done`, `error` and `cancelled` are action states. In
our action creator, we can unlock a deeper level of control by returning
a function:

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

First, the action becomes `open`. This state is useful when waiting for
something to happen, such as loading. When the request finishes, if it
fails, we reject the action, otherwise we resolve it.

**Microcosm actions are cancellable**. Invoking `action.cancel()`
triggers a cancellation event:

```javascript
let action = repo.push(getPlanet, 'Pluto')

// Wait, Pluto isn't a planet!
action.cancel()
```

When `action.cancel()` is called, the action will move into a
`cancelled` state. If a domain doesn’t handle a given state no data
operation will occur.

## A historical account of everything that has happened

The source of truth in Microcosm is a historical tree of every action.

By default, this tree prunes itself as actions complete. However passing
the maxHistory option into Microcosm allows for a compelling debugging
story.

For example, the [Time-Travelling Microcosm
Debugger](https://github.com/vigetlabs/microcosm-debugger):

```javascript
const forever = new Microcosm({ maxHistory: Infinity })
```

![Time Travel](https://github.com/vigetlabs/microcosm-debugger/raw/master/docs/chat-debugger.gif)

## Networks of Microcosms with Presenters

A Presenter is a special React component that can build a view model for
a given state, sending it to child “passive view” components.

All Microcosms sent into a Presenter are
[forked](https://github.com/vigetlabs/microcosm/blob/master/docs/api/microcosm.md#fork),
placing them in a sandbox for data operations specific to their part of
an application:

```javascript
import Presenter from 'microcosm/addons/presenter'

class PaginatedUsers extends Presenter {

  setup (repo, props) {
    repo.add('users', PaginatedUsersDomain)

    repo.push(getUsers, props.page)
  }

  model () {
    return {
      users : state => state.users
    }
  }

  view ({ page, users }) {
    return <UsersTable page={page} users={users} />
  }

}

const repo = new Microcosm()

repo.addDomain('users', UsersDomain)

ReactDOM.render(<PaginatedUsers repo={repo} page="1" />, el)
```

## Learn more

Checkout our [guide to architecture](./guides/architecture.html) or
get going with the [quick start tutorial](./guides/quick-start.html).
