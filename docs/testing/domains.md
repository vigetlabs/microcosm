# Testing Domains

Domains dictate how Microcosm should update state in response to an
action. Domains are free of side-effects, making them easy to test on
their own.

Let's say we have a simple domain that increments a number:

```javascript
import {add} from '../actions/counter'

const Counter= {
  getInitialState() {
    return 0
  },
  increase (state, amount) {
    return state + amount
  },
  register () {
    return {
      [add]: this.increase
    }
  }
}
```

Testing `increase` is simple:

```javascript
import Counter from '../domains/counter'

it('increases the value by a given number', function () {
  let answer = Counter.increase(2, 2)

  expect(answer).toEqual(4)
})
```

## Testing action handlers

More useful than covering an individual Domain operation is to test
the integration point between a Domain and an Action:

```javascript
import Microcosm from 'microcosm'
import Counter from '../domains/counter'
import {add} from '../actions/counter'

it('increases the value by a given number', function () {
  let repo = new Microcosm()

  repo.addDomain('count', Counter)

  repo.push(add, 2)

  expect(repo.state.count).toEqual(2)
})
```

## Testing actions with side-effects

Some times we just want to test the specific handler for a
given action state.

We could use `repo.push()`, however that will immediately execute any
behavior we pass into it. For example, an AJAX request to a server
that simply does not exist in a unit testing environment.

To accommodate this, Microcosm provides an `append` method.

## Using append()

`append` is different from `push` in that it adds a new action to
history, however does not execute it the associated behavior.

```javascript
let repo = new Microcosm()

// this will send out an ajax request
repo.push(ajaxyThing)

// this will just add an action to history, but it
// won't invoke `ajaxyThing`
repo.append(ajaxyThing)
```

## Writing tests using append()

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

This repo is configured to set a loading state while an ajax request
reaches out to retrieve planet information from an API endpoint. When
it finishes, it should replace the existing planet records with the
new information.

From here, we can write succinct tests for each behavior.

```javascript
it('it sets a loading state when pushing getPlanets', assert => {
  const repo = new SolarSystem()

  const action = repo.append(getPlanets)

  action.open()

  assert.equal(repo.state.planets.loading, true)
})

it('it sets a loading state when pushing getPlanets', assert => {
  const repo = new SolarSystem()

  const action = repo.append(getPlanets)

  action.resolve([{ id: '1', name: 'Mercury' }])

  assert.equal(repo.state.planets.loading, false)
  assert.equal(repo.state.planets.records[0].name, 'Mercury')
})
```

By manually calling action methods like `open`, and `resolve`, we can
easily get an action into the state required to trigger a Domain handler.
