# Effects

1. [Overview](#overview)
2. [Subscribing to different action states](#subscribing-to-different-action-states)
3. [API](#api)

## Overview

Effects are one-time handlers that are invoked once, after the action
moves into a different state. They are very similar to Domains,
however their purposes is to handle side-effects. Domains are not the
appropriate place to handle this sort of behavior, as they may
dispatch the same handler several times during the reconciliation of
asynchronous actions.

```javascript
// If an effect implements a setup method, it will receive options as
// the second argument
repo.addEffect(Effect, options)
```

## Subscribing to different action states

Just like Domains, effects can provide a `register` method to dictate
what actions they listen to:

```javascript
const Effect = {

  handler (repo, payload) {
    // side-effect here
  },

  register() {
    return {
      [action] : this.handler
    }
  }
}
```

`action` referenced directly, like `[action]: callback`, refer to the
`done` state.

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
