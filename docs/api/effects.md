# Effects

1. [Overview](#overview)
2. [Creating Effects](#creating-effects)
3. [A quick example](#a-quick-example---query-strings)
4. [API](#api)

## Overview

Not all actions result in updates to application state. For example:

* Writing backup data to `localStorage`
* Sending analytics events
* Persisting query information in the URL.

**Effect handlers fire immediately after Domain handlers and are only
called once per action state.** This means that a repo's state is up to
date with the latest state transitions by the time they execute.

## Creating Effects

There are two ways to create an effect: as a class, and as a plain object. The usage
is roughly the same for both versions, the class form can additionally take
advantage of having a `constructor`.

### Effects as classes

```javascript
class Effect {
  setup (repo, options) {
    // Run startup behavior
  }
  teardown (repo) {
    // Clean up any setup behavior
  }
  handleAction (repo, payload) {
    // Respond once to an action
  }
  register () {
    return {
      [action] : this.handleAction
    }
  }
}

repo.addEffect(Effect)
```

### Effects as plain objects

```javascript
const Effect = {
  setup (repo, options) {
    // Run starting behavior
  },
  teardown (repo) {
    // Clean up
  },
  handleAction (repo, payload) {
    // Respond once to an action
  },
  register () {
    return {
      [action] : this.handleAction
    }
  }
}

repo.addEffect(Effect)
```

Microcosm calls `Object.create` on the simple object form, preventing any
assignments within the Effect from polluting other instances. In this way, they
are somewhat similar to the class form.

## A quick example - query strings

URL persistence is important for shareability and wayfinding. However,
a full routing solution isn't always practical. On some projects we
simply want to push search parameters or other meta data into a query
string.

This is a perfect use case for an effect:

```javascript
// /src/effects/location.js

import url from 'url'
import {patchQuery} from '../actions/query'

class Location {

  updateQuery (repo) {
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
      [patchQuery] : this.updateQuery
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
// /src/effects/planets.js

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

repo.addEffect(Planets)
repo.push(addPlanet, { name: 'earth' }) // this will add Earth
```

### `Effect.defaults`

Specifies default options a Effect is instantiated with. This
provides a concise way to configure sensible defaults for setup
options:

```javascript
class AutoSave {
  static defaults = {
    saveInterval: 5000
  }

  setup (repo, { saveInterval }) {
    console.log(saveInterval) // 5000
  }
}

let repo = new Microcosm()

repo.addEffect(AutoSave) // default saveInterval is 5000
```

When instantiated, default options are determined in the following
order:

1. Microcosm defaults
2. Microcosm instantiation options
3. Effect defaults
4. Instantiation options
4. Options passed to `repo.addEffect`.
