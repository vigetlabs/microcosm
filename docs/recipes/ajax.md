# AJAX

There are two ways to manage asynchronous requests in Microcosm:

1. [Return a Promise](#return-a-promise)
2. [Tap into the lower-level action API](#tap-into-the-lower-level-action-api)

## Return a Promise

Microcosm implements standard behaviors for Promise resolution;
convenient for Promise based AJAX libraries. Whenever an action
creator returns a Promise, it will wait for that Promise to
resolve/reject:

```javascript
// Run this code yourself at:
// https://tonicdev.com/57ac614723722e17003526a7/57ac68df74054114008fbb19
var Microcosm = require("microcosm")
var request = require('superagent')

var app = new Microcosm()

function getSite () {
  return request.get('http://code.viget.com/microcosm')
}

app.addStore('site', function () {
  return {
    [getSite.open]   : () => 'loading',
    [getSite.failed] : () => 'failed',
    [getSite.done]   : () => 'done'
  }
})

app.on('change', function (state) {
  console.log(state.site) // loading, done
})

app.push(getSite)
```

### How it works

When Microcosm detects a Promise returned from an action
creator, it handles it in the following way:

1. Mark the action as `open`. This gives store handlers a way to
   subscribe to a loading state.
2. On resolution, mark the action as `done` and update its payload to
   that of the resolved Promise.
3. On failure, mark the action as `failed` and update its payload to
   the associated error.

### Why did my loading state go away when the action completed?

Microcosm's state management model enables easy clean up of loading
states. Whenever the action moves from `open` to `done`, Microcosm
re-executes all outstanding actions in the order they were pushed.

To illustrate, when the action creator is first pushed into Microcosm,
it inserts an action into Microcosm's historical ledger of all actions
like:

```
1. ajax (open)
```

Microcosm then enumerates through this list, using store handlers to
calculate application state. When the action completes, it moves into
a `done` state:

```
1. ajax (done)
```

Again, Microcosm rolls forward through the history list, recalculating
state for the application.

Since the action is no longer in an `open` state, the
resulting application state will be as though the loading store
handler never fired. There's no cleanup.

## Tap into the lower-level action API

Promises are easy to use, but they have a couple of problems when
representing HTTP requests. Cancellation is difficult, and progress
updates are impossible.

Returning a function from an action creator provides a way to tap into
the lower level API for an action:

```javascript
// Run this code yourself
// https://tonicdev.com/57ac614723722e17003526a7/57ac7db6a55ecf1200fa1e5c
var request = require('superagent')

var app = new Microcosm()

function getSite () {
  return function (action) {
    action.open()

    request.get('http://code.viget.com/microcosm').end(function(error, payload) {
      if (error) {
        action.reject(error)
      } else {
        action.close(payload)
      }
    })
  }
}

app.addStore('site', function () {
  return {
    [getSite.open]   : () => 'loading',
    [getSite.failed] : () => 'failed',
    [getSite.done]   : () => 'done'
  }
})

app.on('change', function (state) {
  console.log(state.site)
})

app.push(getSite)
```
