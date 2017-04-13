# Batch Updates

Microcosm will never fire a `change` event if data is the
same. However it is still possible to push a large number of actions
at the same time, all of which modify data.

The solution to this is to emit fewer `change` events. To wait for a
few actions to complete, then emit a single `change` event at once. We
call this "batching".

## The Challenge

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
to wait a few milliseconds before changing, this will never happen.

To deal with this problem, Microcosm can accept an `updater`
instantiation option. This makes it easy to configure the update
process for a specific environment.

## The updater option

Microcosm provides an `updater` instantiating option that allows you
to customize the update process:

```javascript
function updater () {
  // update is a function, executing it will send a request to
  // Microcosm, asking it trigger a change event if anything changed
  return update => {
    // Do whatever you want...

    // Then call update when you want to ask Microcosm to check for
    // changes
    update()
  }
}
```

For batch operations, we recommend
using
[requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback).

`requestIdleCallback` waits for user interaction and other browser
work to finish before executing a provided callback. Additionally, it
can be configured to never wait longer than a specified period of
time:

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
  // Keep track of the last frame of work
  let frame = null

  return update => {
    if (frame == null) {
      frame = requestIdleCallback(() => {
        frame = null
        update()
      }, options)
    }
  }
}
```

Then, when creating a Microcosm, pass this function as the `updater`
option:

```javascript
let repo = new Microcosm({ updater: requestIdleBatch })
```
