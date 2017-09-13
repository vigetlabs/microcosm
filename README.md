# [![Microcosm](http://code.viget.com/microcosm/assets/microcosm.svg)](http://code.viget.com/microcosm/)

[![CircleCI](https://img.shields.io/circleci/project/vigetlabs/microcosm.svg?maxAge=2592000)](https://circleci.com/gh/vigetlabs/microcosm)
[![Codecov branch](https://img.shields.io/codecov/c/github/vigetlabs/microcosm/master.svg)](https://coveralls.io/github/vigetlabs/microcosm)
[![npm](https://img.shields.io/npm/v/microcosm.svg?maxAge=2592000)](https://www.npmjs.com/package/microcosm)
[![npm](https://img.shields.io/npm/dm/microcosm.svg?maxAge=2592000)](https://www.npmjs.com/package/microcosm)

Microcosm is a state management tool for [React](https://github.com/facebook/react) (and similar libraries). Keep track of user actions, cancel requests, and perform optimistic updates with ease.

## What you get

- A central place to track all application data
- [Schedule work with actions](./docs/api/actions.md)
- Actions understand Promises out of the box and move through predefined states.
- Keep loading states out of the data layer. Track action progress using [status callbacks](./docs/api/actions.md#ondonecallback-scope).
- [Split up application state in large apps](./docs/api/microcosm.md#fork) while still sharing common data
- [Painless optimistic updates](./docs/recipes/ajax.md)
- Track changes and handle business logic with [Presenter components](./docs/api/presenter.md)
- 5.5kb gzipped (~18kb minified)

## What it looks like

```javascript
import Microcosm, { get, set } from 'microcosm'
import axios from 'axios'

let repo = new Microcosm()

function getUser (id) {
  // This will return a promise. Microcosm automatically handles promises.
  // See http://code.viget.com/microcosm/api/actions.html
  return axios(`/users/${id}`)
}

// Domains define how a Microcosm should turn actions into new state
repo.addDomain('users', {
  getInitialState () {
    return {}
  },
  addUser (users, record) {
    // The set helper non-destructively assigns keys to an object
    return set(users, record.id, record)
  },
  register () {
    return {
      [getUser]: {
        done: this.addUser
      }
    }
  }
})

// Push an action, a request to perform some kind of work
let action = repo.push(getUser, 2)

action.onDone(function () {
  let user = get(repo.state, ['users', '2'])

  console.log(user) // { id: 2, name: "Bob" }
})

// You could also handle errors in a domain's register method
// by hooking into `getUser.error`
action.onError(function () {
  alert("Something went terribly wrong!")
})
```

## How to get started

Checkout the [installation guide](http://code.viget.com/microcosm/guides/installation.html), then dive into [our quickstart](http://code.viget.com/microcosm/guides/quickstart.html)!

---

<a href="http://code.viget.com">
  <img src="http://code.viget.com/github-banner.png" alt="Code At Viget">
</a>

Visit [code.viget.com](http://code.viget.com) to see more projects from [Viget.](https://viget.com)
