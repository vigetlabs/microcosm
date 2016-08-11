# [![Microcosm](http://code.viget.com/microcosm/images/microcosm.svg)](http://code.viget.com/microcosm/)

[![CircleCI](https://img.shields.io/circleci/project/vigetlabs/microcosm.svg?maxAge=2592000)](https://circleci.com/gh/vigetlabs/microcosm)
[![Coveralls](https://img.shields.io/coveralls/vigetlabs/microcosm.svg?maxAge=2592000)](https://coveralls.io/github/vigetlabs/microcosm)
[![npm](https://img.shields.io/npm/v/microcosm.svg?maxAge=2592000)](https://www.npmjs.com/package/microcosm)
[![npm](https://img.shields.io/npm/dm/microcosm.svg?maxAge=2592000)](https://www.npmjs.com/package/microcosm)

Flux with central, isolated state.

**Important**. Master is prepping for the next major release
(10.x). See the
[9-stable branch](https://github.com/vigetlabs/microcosm/tree/9-stable)
for relevant documentation and examples.

1. [Documentation](#documentation)
2. [Overview](#overview)
3. [Opinions](#opinions)
4. [What is it trying to solve?](#what-is-it-trying-to-solve)

## Documentation

Comprehensive documentation can be found in the [docs section of this repo](docs).

If you'd rather look at working code, head over to the [example apps](examples).

### Installation
```
npm install --save microcosm
```

## Overview

Microcosm is a variant of [Flux](https://facebook.github.io/flux/)
that makes it easier to control and modify state in a pure,
centralized way. It thinks of stores and actions as stateless
collections of pure functions, keeping all data encapsulated in a
specific instance of Microcosm.

### Stateless stores

Stores hold no state; instead they are responsible for writing state
to the repository owned by a Microcosm instance.

This allows stores to be simple collections of pure functions that
transform old data into new data. The `register` hook tells Microcosm
what actions a store should respond to:

```javascript
const Planets = {
  // Tells a Microcosm how a store should respond to actions
  register() {
    return {
      [addPlanet] : this.add
    }
  },
  // Store handlers are pure functions that take an old state and
  // transform it into a new state
  add(planets, props) {
    return planets.concat(props)
  }
}
```

Visit [the API documentation for stores](./docs/api/stores.md) to
read more.

### No action constants

Microcosm automatically generates action type constants based upon the
referential identity of the action and the current state of its
lifecycle.

An action can be in several states: `open`, `loading`, `done`,
`failed`, and `cancelled`. Stores can subscribe to each of these
states through the use of a `register` function:

```javascript
function createPlanet (params) {
  return ajax.post('/planets', params)
}

repo.addStore('planets', {
  getInitialState() {
    return { records: [], loading: false }
  },

  addPlanet(planets, props) {
    return { ...planets, records: planets.records.concat(props) }
  },

  setLoading(planets) {
    return { ...planets, loading: true }
  },

  register() {
    [createPlanet]      : this.addPlanet,
    [createPlanet.open] : this.setLoading,
  }
})


// Creates a action of type "createPlanet" that dispatches to stores
repo.push(createPlanet, params)
```

When an action is pushed, it is placed into a journal of all actions
that have occurred. During the `open` state, the action is in a state
where the request has been opened however it is not complete. When the
request finishes, the action spawned by `createPlanet` will move into
a `done` state. Microcosm will then re-run through the list of actions
documented in the journey to produce a new repo state that
accounts for the completion of the request.

Visit [the API documentation for actions](./docs/api/actions.md) to
read more.

### Actions are first-class entities

Every action spawned by `repo.push()` returns an `Action` to represent
its resolution. This object provides a consistent API, no matter what
value is returned from an action creator:

```javascript
const action = repo.push(myAction)

action.onUpdate(handleProgress)
action.onDone(handleSuccess)
action.onError(handleFailure)
```

### Actions are cancellable

Often an action needs to be cancelled. Users leave a page, or submit a
new query. Actions provide a `cancel` method and event API for dealing
with these circumstances:

```javascript
function search (query) {
  // The "thunk" mode for action creators. See the ./docs/api/actions.md
  return function (action) {
    action.open()

    var request = ajax.get('/search', query, function (error, body) {
      if (error) {
        return action.reject(error)
      } else {
        action.close(body)
      }
    })


    action.on('cancel', () => request.abort())
  }
}

const page1 = repo.push(search, { term: 'cats', page: 1 })

// (User visits page 2 before page 1 loads)
page1.cancel()

const page2 = repo.push(search, { term: 'cats', page: 2 })
```

Cancelled actions are put into a `cancelled` state, which can be
subscribed to in stores.

## Action history

Internally, Microcosm calculates state by rolling forward through a historical account of all actions. While still experimental, Microcosm exposes API methods for working with history. For example, the time-travelling Microcosm debugger:

<a href="https://github.com/vigetlabs/microcosm-debugger" style="display: block">
  <img style="display: block; margin: 0 auto;" src="https://github.com/vigetlabs/microcosm-debugger/raw/master/docs/chat-debugger.gif" alt="Microcosm Debugger" width="600" />
</a>

## Opinions

1. Action CONSTANTS are automatically generated by assigning
   each Action function a unique `toString` signature under the hood.
2. Actions handle all asynchronous operations. Stores are
   synchronous.
3. Stores do not contain data, they _transform_ it.

## What is it trying to solve?

1. State isolation. Requests to render applications server-side should
   be as stateless as possible. Client-side libraries (such as
   [Colonel Kurtz](https://github.com/vigetlabs/colonel-kurtz)) need easy
   containment from other instances on the page.
2. Singletons are simple, but make it easy to accidentally share
   state. Microcosm keeps data in one place, operating on it
   statelessly in other entities.
3. Easy extension of core API and layering of features out of the
   framework's scope.

## Inspiration

- [Worlds](http://www.vpri.org/pdf/rn2008001_worlds.pdf)
- [Om](https://github.com/omcljs/om)
- [Elm Language](https://elm-lang.org)
- [Flummox](https://github.com/acdlite/flummox)
- [But the world is mutable](http://www.lispcast.com/the-world-is-mutable)
- [Event Sourcing Pattern](http://martinfowler.com/eaaDev/EventSourcing.html)
- [Apache Kafka](http://kafka.apache.org/)
- [LMAX Architecture](http://martinfowler.com/articles/lmax.html)

***

<a href="http://code.viget.com">
  <img src="http://code.viget.com/github-banner.png" alt="Code At Viget">
</a>

Visit [code.viget.com](http://code.viget.com) to see more projects from [Viget.](https://viget.com)
