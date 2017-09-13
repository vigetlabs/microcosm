# microcosm-react-router

Sync up react-router with Microcosm. This is experimental, and heavily
inspired by [`react-router-redux`](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-redux)

1. [Installation](#installation)
2. [Setup](#setup)
3. [Manipulating History](#manipulating-history)
4. [Routing Middleware](#routing-middleware) (add query string parsing)
5. [API](#api)

## Installation

```shell
npm install --save microcosm-react-router
npm install --save history
```

## Setup

microcosm-react-router is implemented through a `Location` domain:

```javascript
import createBrowserHistory from 'history/createBrowserHistory'
import Microcosm from 'microcosm'
import { Location } from 'microcosm-react-router'

class Repo extends Microcosm {
  setup({ history }) {
    this.addDomain('location', Location, { history })
  }
}

let history = createBrowserHistory()
let repo = new Repo({ history })

// Then pass history to React Router
```

## Manipulating history

Control history by pushing actions:

```javascript
import { push, replace, go, goBack, goForward } from 'microcosm-react-router'

repo.push(push, '/')

repo.push(goBack)
```

Checkout the [`history`](https://github.com/ReactTraining/history)
package for API documentation.

## Routing Middleware

Add additional data processing to location data via middleware passed
when adding the Location domain:

```javascript
import Microcosm, { set } from 'microcosm'
import Location from 'microcosm-react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import qs from 'querystring'

let repo = new Microcosm()
let history = createBrowserHistory()
let middleware = [
  location => set(location, 'query', qs.parse(location.search))
]

repo.addDomain('location', Location, { history, middleware })
```

## API

### Location Domain

#### Options

- **history**: an instance of the history package
- **middleware**: an array of functions to process raw location data (see [middleware](#middleware))

#### Middleware

Middleware allow extra processing of location data:

```javascript
import { set } from 'microcosm'
import { parse } from 'query-string'

let middleware = [
  // Add parsed query data 
  location => set(location, 'query', parse(location.search))
]
```

### Actions

These actions directly map to methods in
the [`history`](https://github.com/ReactTraining/history) package,
which is the underlying kernel for react-router.

#### push(path, state)

Push a new entry in the history stack.

#### replace(path, state)

Replace the current entry in the history stack.

#### go(index)

Visit a specific index in the history stack.

#### goBack()

Return to the previous history stack entry.

#### goForward()

Go to the next history stack entry.

