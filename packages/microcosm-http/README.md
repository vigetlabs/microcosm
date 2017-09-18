# Microcosm HTTP

An AJAX library for Microcosm.

**Status**: Design phase

## Design Goals

- [ ] Small, no dependency on Promises. Actions can turn into Promises if need be.
- [ ] File uploads
- [ ] Server-side rendering
- [ ] Request cancellation
- [ ] Automatic request cancellation based on a token
- [ ] A consistent data format for progress
- [ ] A consistent data format for errors
- [ ] Error localization

## Things to figure out

- [ ] How to cleanly distinguish between URL parameters and query strings?
- [ ] Is the cancellation token concept sound?

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

// Basic POST
repo.push('createPlanet', { name: 'Pluto' })

// Automatic action cancellation given a unique token
let token = generateToken()

let getOne = repo.push('readPlanet', { params: { id: 0 } }, { token })

// This will cancel the request above because they use the same token
// this says "I don't care about that other request"
let getTwo = repo.push('readPlanet', { params: { id: 1 } }, { token })

console.log(getOne.status) // "cancel"
```
