## Tasks

Microcosm organizes itself around a history of tasks. As those tasks
move through a set lifecycle, Microcosm reconciles them in the order
they were created.

Invoking `push()` appends to that history, and returns a `Task` object
to represent it:

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

## Domains: Stateless Stores

A Domain is a collection of side-effect free operations for manipulating
data. As tasks update, Microcosm uses domains to determine how state
should change. Old state comes in, new state comes out:

```javascript
import { getPlanet } from './actions/planets'

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

By implementing a register method, domains can subscribe to tasks that
have particular types. These types are defined by the associated
action. **Action type constants are generated automatically whenever
an action is dispatched for the first time**.

## Pending, failed, and cancelled requests

Microcosm makes it easy to handle pending, loading, cancelled,
completed, and failed requests:

```javascript
import { getPlanet } from '../actions/planets'

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

`open`, `loading`, `done`, `error` and `cancelled` are task states. In
our action, we can unlock a deeper level of control over the task for
a given action returning a function:

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

First, the task becomes `open`. This state is useful when waiting for
something to happen, such as loading. When the request finishes, if it
fails, we reject the task, otherwise we resolve it.

**Microcosm tasks are cancellable**. Invoking `task.cancel()`
triggers a cancellation event:

```javascript
import { getPlanet } from './actions/planets'

let task = repo.push(getPlanet, 'Pluto')

// Wait, Pluto isn't a planet!
task.cancel()
```

When `task.cancel()` is called, the task will move into a `cancelled`
state. If a domain doesn’t handle a given state no data operation will
occur.

## A historical account of everything that has happened

The source of truth in Microcosm is a historical tree of every task.

By default, this tree prunes itself as tasks complete. However passing
the maxHistory option into Microcosm allows for a compelling debugging
story.

For example, the [Time-Travelling Microcosm
Debugger](https://github.com/vigetlabs/microcosm-debugger):

```javascript
const forever = new Microcosm({ maxHistory: Infinity })
```

![Time Travel](assets/chat-debugger.gif)

## Networks of Microcosms with Presenters

A Presenter is a special React component that can build a view model for
a given state, sending it to child “passive view” components.

All Microcosms sent into a Presenter are
[forked](https://github.com/vigetlabs/microcosm/blob/master/docs/api/microcosm.md#fork),
placing them in a sandbox for data operations specific to their part of
an application:

```javascript
import Presenter from 'microcosm/addons/presenter'
import { getUsers } from '../actions/users'

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

## Why another Flux?

Good question! Other popular implementations of Flux treat actions as static
events. The result of calling a `dispatch` method or resolving some sort of
data structure like a `Promise`.

But what about everything before that point? A user might get tired of waiting
for a file to upload, or dip into a subway tunnel and lose connectivity. They
might want to retry an request, cancel it, or just see what's happening.

The burden of this state often falls on data stores (Domains, in Microcosm) or a home-grown solution
for tracking outstanding requests and binding them to related action data.

While manageable, we've found that this can be cumbersome. That it can lead to interface-specific requirements
leaking into the data layer, resulting in complicated code, and unexpected bugs as requirements change.

### How Microcosm is different

Microcosm thinks of actions as **_stories_**. A dispatched action
creates a Task that records key moments as an action goes from start
to completion. Tasks have a common public interface, regardless of
what data structures or asynchronous patterns are utilized. An
interface that is easy to query from the presentation layer in order
to handle use-case specific display requirements.

This makes it easier to handle complicated behaviors such as optimistic updates,
dialog windows, or long running processes.


## Learn more

Get going with the [quickstart tutorial](./guides/quickstart.html), or
dive deeper with our [guide to architecture](./guides/architecture.html).
