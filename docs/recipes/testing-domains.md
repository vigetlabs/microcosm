# Testing Domains

1. [Overview](#overview)
2. [Writing test](#writing-tests)

## Overview

Domains control how a repo's should update based upon the state of an
action. Some times we just want to test the specific handler for a
given action state.

The challenge here is that pushing an action into a repo could trigger
a side-effect that needs to be controlled for. For example, an action
may fire an AJAX request to a server that simply does not exist in a
unit testing environment.

To address this issue, Microcosm provides an `append` method. `append`
is different from `push` in that it adds a new action to history,
however does not execute it the associated behavior.

```javascript
let repo = new Microcosm()

// this will send out an ajax request
repo.push(ajaxyThing)

// this will just add an action to history, but it
// won't invoke `ajaxyThing`
repo.append(ajaxyThing)
```

## Writing tests

Using `append` makes it easy to write tests for domain handlers at
precise moments within an action. Let's assume the following repo:

```javascript
function getPlanets () {
  return ajax.get('/planets')
}

const PlanetsDomain = {
  getInitialState () {
    return { loading: false, records: [] }
  },

  patch (state, records) {
    return { ...state, records }
  },

  loading (state) {
    return { ...state, loading: true }
  },

  register() {
    return {
      [getPlanets.done]: this.patch,
      [getPlanets.open]: this.loading
    }
  }
}

class SolarSystem extends Microcosm {
  setup() {
    this.addStore('planets', Planets)
  }
}
```

Just to recap, this repo is configured to set a loading state while an
ajax request reaches out to retrieve planet information from an API
endpoint. When it finishes, it should replace the existing planet
records with the new information.

From here, we can write succinct tests for each behavior.

```javascript
test('it sets a loading state when pushing getPlanets', assert => {
  const repo = new SolarSystem()

  const action = repo.append(getPlanets)

  action.open()

  assert.equal(repo.state.planets.loading, true)
})

test('it sets a loading state when pushing getPlanets', assert => {
  const repo = new SolarSystem()

  const action = repo.append(getPlanets)

  action.resolve([{ id: '1', name: 'Mercury' }])

  assert.equal(repo.state.planets.loading, false)
  assert.equal(repo.state.planets.records[0].name, 'Mercury')
})
```
