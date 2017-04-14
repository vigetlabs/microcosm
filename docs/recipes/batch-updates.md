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

## The batch option

Microcosm provides a `batch` option that tells Microcosm that it is
okay to group multiple change events together. This reduces the number
of change events, resulting in less rendering. For example, without
batching, this code would fire 3 change events:

```javascript
let repo = new Microcosm()

let add = (n) => n

repo.addDomain('count', {
  getInitialState () {
    return 0
  },
  register () {
    return {
      [add]: (count, n) => count + 1
    }
  }
})

repo.push(add, 2) // change!
repo.push(add, 2) // change!
repo.push(add, 2) // change!
```

With batching, only a single change event would fire:

```javascript
let repo = new Microcosm({ batch: true })

// ...

repo.push(add, 2)
repo.push(add, 2)
repo.push(add, 2)

// change!
```

## The updater option

Most of the time, `batch: true` should be sufficient for accommodating
apps with a high degree of change. However Microcosm provides an
`updater` option that allows for more specific customization of the
update process. For example, if we wanted to batch updates to a 12
millisecond interval:

```javascript
function updater () {
  // update is a function, executing it will send a request to
  // Microcosm, asking it trigger a change event if anything changed
  return update => setTimeout(update, 12)
}
```

This will spool up any changes within a 12 millisecond time frame,
sending out a larger update after the timeout completes.

## Gotchas with testing

The problem with batching is that you have to wait, which is
problematic for testing. For example:

```javascript
import App from 'src/views/application'
import { mount } from 'enzyme'

test("it increases the number when the stepper is clicked", function () {
  let app = mount(<App />)

  app.find('#stepper').simulate('click')

  let count = app.find('#count').text()

  expect(count).toEqual('1')
})
```

The test above is synchronous. It expects the Microcosm associated
with `App` to update immediately. However, if we configure Microcosm
to wait a few milliseconds before changing, this won't have happened
yet.

The easiest way to deal with this problem is to **only pass `batch:
true` for user facing code**. However you could also lean in
`repo.history.wait()`, which introduces a few more elements to the
test:

```javascript
import Repo from 'src/repo'
import App from 'src/views/application'
import { mount } from 'enzyme'

test("it increases the number when the stepper is clicked", async function () {
  let repo = new Repo()
  let app = mount(<App repo={repo} />)

  app.find('#stepper').simulate('click')

  // wait() will pause this test until all actions finish
  await repo.history.wait()

  let count = app.find('#count').text()

  expect(count).toEqual('1')
})
```
