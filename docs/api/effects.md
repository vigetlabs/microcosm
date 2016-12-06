# Effects

1. [Overview](#overview)
2. [A quick example](#a-quick-example---query-strings)
3. [API](#api)

## Overview

Use effects to define side-effects. A side-effect may include
persistence in localStorage, updating a page title, or some other
mutative behavior.

**Effect handlers are only called once per action state.** This is
different than Domains, which may have to invoke the same handler
multiple times during the reconciliation of asynchronous actions.

## A quick example - query strings

URL persistence is important for shareability and wayfinding. However,
a full routing solution isn't always practical. On some projects we
simply want to push search parameters or other meta data into a query
string.

This is a perfect use case for an effect:

```javascript
import url from 'url'
import {push} from '../actions/query'

class Location {

  pushQuery (repo) {
    const { origin, hash } = window.location

    const location = url.format({
      host  : origin,
      query : repo.state.query,
      hash  : hash
    })

    window.history.pushState(null, null, location)
  }

  register () {
    return {
      [push] : this.pushQuery
    }
  }
}

export default Location
```

## API

### `setup(repo, options)`

Setup runs right after an effect is added to a Microcosm. It receives
that repo and any options passed as the second argument.

### `teardown(repo)`

Runs whenever `Microcosm::teardown` is invoked. Useful for cleaning up
work done in `setup()`.

### `register()`

Returns an object mapping actions to methods on the effect. This is the
communication point between a effect and the rest of the system.

```javascript
import { addPlanet } from '../actions/planets'

class Planets {
  //...
  register () {
    return {
      [addPlanet]: this.alert
    }
  }

  alert (repo, planet) {
    alert('A planet was added! ' + planet.name)
  }
}

repo.push(Actions.add, { name: 'earth' }) // this will add Earth
```
