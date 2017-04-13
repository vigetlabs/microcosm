# Batch Updates

Microcosm will never fire a `change` event if data is the
same. However it is still possible to push a large number of actions
at the same time, all of which modify data.

The problem is that each of these actions will trigger a `change`
event, which may cause a costly re-render. If an animation is playing,
the user might see a degradation in frame rate.

An easy solution for this is simply to emit fewer `change` events. To
wait for a few actions to complete, then emit a single `change` event
at once. We call this "batching".

## The updater option

Microcosm provides an `updater` option that allows for customization
of the update process. For example, if we wanted to batch updates to a
12 millisecond interval:

```javascript
function updater () {
  // update is a function, executing it will send a request to
  // Microcosm, asking it trigger a change event if anything changed
  return update => setTimeout(update, 12)
}
```

This will spool up any changes within a 12 millisecond time frame,
sending out a larger update after the timeout completes.

This certainly works, however we recommend
using
[`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) when
possible. `requestIdleCallback` waits for user interaction and other
browser work to finish before executing a provided
callback. Additionally, it can be configured to never wait longer than
a specified period of time:

```javascript
function doWork () {
  // Whatever work you need to do goes here
}

requestIdleCallback(doWork, { timeout: 24 })
```

The code above will execute `doWork` when the browser is ready for it,
however it will never wait longer than 24 milliseconds. Integrating
this into the Microcosm `updater` option is simple:

```javascript
// A lot of browsers don't support requestIdleCallback, so we patch it
import 'ric'

// Never let the user wait more than 24 milliseconds for an update
const options = { timeout: 24 }

function requestIdleBatch () {
  return update => requestIdleCallback(update, options)
}
```

Then, when creating a Microcosm, pass this function as the `updater`
option:

```javascript
let repo = new Microcosm({ updater: requestIdleBatch })
```

## Gotchas with testing

The problem with batching is that you have to wait, which is
problematic for testing. For example:

```javascript
import App from 'src/views/application'
import { mount } from 'enzyme'

test("it increases the number when the stepper is clicked", function () {
  let app = mount(<App />)

  app.find('#stepper).simulate('click')

  let count = app.find('#count').text()

  expect(count).toEqual('1')
})
```

The test above is synchronous. It expects the Microcosm associated
with `App` to update immediately. However, if we configure Microcosm
to wait a few milliseconds before changing, this won't have happened
yet.

The easiest way to deal with this problem is to only passing a custom
`updater` to user facing code. However you could also lean in
`repo.history.wait()`, which introduces a few more elements to the
test:

```javascript
import Repo from 'src/repo'
import App from 'src/views/application'
import { mount } from 'enzyme'

test("it increases the number when the stepper is clicked", async function () {
  let repo = new Repo()
  let app = mount(<App repo={repo} />)

  app.find('#stepper).simulate('click')

  // wait() will pause this test until all actions finish
  await repo.history.wait()

  let count = app.find('#count').text()

  expect(count).toEqual('1')
})
```
