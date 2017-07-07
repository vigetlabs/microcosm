# Immutability Helpers

1. [Overview](#overview)
2. [API](#API)

## Overview

Microcosm requires immutable updates. This makes it easier to track changes,
support Microcosm's action history, and keep things fast. However the
ergonomics and details of this can be a bit frustrating. Let's say we want to
update a nested key:

```javascript
let user = { id: 'Billy', facts: { height: 72, age: 23 } }

// Update the user's age
let next = {...user, facts: {...facts, age: 24 } }
```

Spreading can quickly get out of hand, and always copies data even if it hasn't
changed. Alternatively, we could use the immutability helpers that ship with
Microcosm:

```javascript
import { set } from 'microcosm'

let user = { id: 'Billy', facts: { height: 72, age: 23 } }

let next = set(user, 'facts.age', 24)
```

Additionally, `set` will not perform an update if no value requires changing.

Microcosm uses these utilities internally. Pulling them into your application
allows you to reuse that code. However if you are evaluating alternatives, we
recommend [immutability-helper](https://github.com/kolodny/immutability-helper).

---

## API

### get(object, keypath, fallback?)

Safely retrieve a value from an object. If that value is not defined,
optionally return a fallback value:

```javascript
import { get } from 'microcosm'

let state = {
  planets: {
    earth: { color: 'blue' },
    mars: { color: 'red' }
  }
}

// Pass a simple string key
let planets = get(state, 'planets')
console.log(planets) // { earth, mars }

// An array of keys to access a deeply nested value
let earth = get(state, ['planets', 'earth'])
console.log(earth) // { color: 'blue' }

// Or a string keypath can also be used to access a deeply nested value
let earth = get(state, 'planets.earth')

// If a value isn't found
let color = get(state, ['planets', 'venus', 'color'])
console.log(color) // undefined

// Optionally, provide a fallback if a value isn't found
let color = get(state, ['planets', 'venus', 'color'], 'black')
console.log(color) // 'black'
```

### set(object, keypath, value)

Safely assign a property to an object. If the keypath provided is not
defined within the object, it will produce new objects until it
reaches the final key, in which case it will assign the value.

`set` never modifies data in place. It will always return a new
object, unless assigning the value would make no change.

```javascript
import { set } from 'microcosm'

let state = {
  planets: {
    earth: { color: 'blue' },
    mars: { color: 'red' }
  }
}

// Pass a simple string key
let next = set(state, 'center', 'sol')
console.log(next) // { center, planets }

// An array of keys to deeply assign a value
let next = set(state, ['planets', 'venus'], { color: 'yellow' })
console.log(state) // { planets: { venus, earth, mars } }

// Or a string keypath can be used to deeply assign a value
let next = set(state, 'planet.venus', {color: 'yellow' })
console.log(state) // { planets: { venus, earth, mars } }

// If the value is the same, no change will occur
let next = set(state, ['planets', 'earth', 'color'], blue)
console.log(next === subject) // true
```

### update(target, key, processor, fallback?)

Extract a value from a keypath, then call a function on that value and assign
the result at the same point. This is useful for modifying values in-place:

```javascript
import { update } from 'microcosm'

let state = {
  population = 7500000000
  planets: {
    earth: { mass: 1 },
    mercury: { mass: 0.055 },
    jupiter: { mass: 316 },
  }
}

// Pass a simple string key
let next = update(state, 'population', n => n + 1)

// An array of keys to update a deeply nested value
let next = update(state, ['planets', 'jupiter', 'mass'], n => n + 1)

// Or a string keypath can be used to do deeply nested updates
let next = update(state, 'planets.jupiter.mass', n => n + 1)

console.log(next.population) // 7500000001
```

`update` also accepts a fallback value. If the provided keypath is missing, the
processor function will be called with the fallback value:

```javascript
import { update } from 'microcosm'

let votes = { yay: 0, nay: 0 }
let next = update(votes, 'undecided', n => n + 1, 0)

console.log(next) // { yay: 0, nay: 0, undecided: 1 }
```

### merge(...objects)

Non-destructively merge together the keys of any number of objects,
starting from left to right. Returns a new object if any of the keys
changed.

```javascript
import { merge } from 'microcosm'

let earth = { color: 'blue' }

// Folding in new values returns a new object
let newEarth = merge(earth, { color: 'azule' })
console.log(newEarth) // { color: 'azule' }
console.log(newEarth === earth) // false

// Folding in the same values yields no change
let update = merge(earth, { color: 'blue' }
console.log(updated === earth) // true
```
