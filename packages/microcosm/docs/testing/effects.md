# Testing Effects

Effects provide a way to control side-effects. A side-effect may
include persistence in localStorage, updating a page title, or some
other mutative behavior.

This can be a challenge for testing, as a side-effect may mutate a
globally available piece of state.

## Wrangling Effects

The [Jest](http://facebook.github.io/jest/) test runner provides a
sandbox for every test suite. This helps us deal with the issues of
stateful testing -- particularly in the DOM.

By using the [jsdom](https://github.com/tmpvar/jsdom) environment
setting, Jest can setup a unique DOM for every test. This can be
enabled via the `--env` CLI flag, or `env` configuration option:

```bash
# We might run our tests like:
jest --env jsdom
```

With that in mind, let's jump into an example

## Testing an Effect

In our guide on Effects, we went through an example that updates the
query string parameter of the URL. Recall our `Location` effect:

```javascript
import url from 'url'
import { patch } from '../actions/query'

class Location {
  updateQuery(repo) {
    const { origin, hash } = window.location

    const location = url.format({
      host: origin,
      query: repo.state.query,
      hash: hash
    })

    window.history.pushState(null, null, location)
  }

  register() {
    return {
      [patchQuery]: this.updateQuery
    }
  }
}

export default Location
```

So in the case above, whenever a `patchQuery` action resolves, it'll
run through some logic to update the URL location. Triggering that
might look something like:

```javascript
import Microcosm from 'microcosm'
import Location from './effects/location'
import { patchQuery } from './actions/query'

let repo = new Microcosm()

repo.addEffect(Location)

// The query string will now be ?page=10
repo.push(patchQuery, { page: 10 })
```

With that out of the way, let's move into testing.

### Teaching Jest about URLs

This test will require using the browser's
[`pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History_API) API,
that means we need to teach Jest to operate at a test
URL. Otherwise, you'll see an error that looks something like:

```bash
SecurityError
  at HistoryImpl._sharedPushAndReplaceState (~/jsdom/...)
```

Not good. So let's fix that! Jest keeps all of it's configuration in
a JSON file. By default, this is the `package.json` for your project:

```javascript
// ... config
"jest": {
  "testURL": "http://example.com"
}
// ... config
```

That should do it for configuration. Now let's move on to a test!

## A basic test

The simplest thing would be to just reproduce our usage example as a test:

```javascript
import Microcosm from 'microcosm'
import Location from './effects/location'
import { patchQuery } from './actions/query'

describe('Location Effect', function() {
  it('it updates the URL when a repo is sent patchQuery', function() {
    let repo = new Microcosm()

    repo.addEffect(Location)

    repo.push(patchQuery, { page: 10 })

    expect(window.location.search).toContain('page=10')
  })
})
```

`toContain` will check to see if one string is a part of another. In
this case, it's checking to see if the URL parameters are what we expect.

## Controlling for change

Our previous test is great, but how do we prevent future tests from
being affected by those that have already run?

Jest provides a `beforeEach` function that makes it easy to perform a
bit of work before every test runs. We can use it to set up our test:

```javascript
import Microcosm from 'microcosm'
import Location from './effects/location'
import { patchQuery } from './actions/query'

describe('Location Effect', function() {
  beforeEach(function() {
    window.location.search = ''
  })

  // ...
})
```

Nice! Now every test will start with a clean slate!

## Wrapping up

The important thing to remember when testing Effects is to control for
the destructive changes they may apply. By setting up your testing
environment to sandbox their changes, testing Effects becomes much
easier.
