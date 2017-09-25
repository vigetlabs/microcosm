# Microcosm HTTP

An AJAX library for Microcosm.

**Status**: Design phase

## Design Goals

- [x] File uploads
- [x] Isomorphic
- [x] Request cancellation
- [ ] Automatic request cancellation based on a token
- [ ] A consistent data format for progress
- [ ] A consistent data format for errors
- [x] Error localization

## Things to figure out

- [ ] How to cleanly distinguish between URL parameters and query strings?
- [ ] Is the cancellation token concept sound?
- [ ] Find a good, small client that isn't based on promises. 

## Pseudo Code

```javascript
import Microcosm from 'microcosm'
import { create, read, update, destroy, generateToken } from 'microcosm-http'

class Planets {
  actions: {
    createPlanet: create('planets'),
    readPlanet: read('planets/:id')
    readPlanets: read('planets'),
    updatePlanet: update('planets'),
    destroyPlanet: destroy('planets')
  }
  //...
}

repo.addDomain('planets', Planets)


// POST
// action, body, query, options
repo.push('createPlanet', { name: 'Pluto' })


// GET
// action, params, query, options

// Automatic action cancellation given a unique token
let token = generateToken()

let getOne = repo.push('readPlanet', { id: 0 }, null, { token })

// This will cancel the request above because they use the same token
// this says "I don't care about that other request"
let getTwo = repo.push('readPlanet', { id: 1 }, null, { token })

console.log(getOne.status) // "cancel"
```
