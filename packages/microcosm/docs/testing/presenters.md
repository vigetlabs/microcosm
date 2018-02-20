# Testing Presenters

Microcosm Presenters, using the `ActionButton`, `Form`, and `withSend`
add-ons, can listen to messages sent from child components deep within a
component tree. This recipe walks through testing that functionality.

## The Basic Mechanics

The communication process relies on
[context](https://facebook.github.io/react/docs/context.html), which can add
some complexity when testing. Fortunately, setting up context with the
[`enzyme`](https://github.com/airbnb/enzyme) testing library makes this
painless. We use the following helper when testing actions to make this process
easy:

```javascript
import React from 'react'
import MyForm from 'somewhere'
import { mount } from 'enzyme'

it('broadcasts an action when submitted', function() {
  // You could use any testing library as long as your testing
  // environment has spies. We're using Jest here
  const send = jest.fn()

  const wrapper = mount(<MyForm />, {
    context: { send },
    childContextTypes: {
      send: React.PropTypes.func
    }
  })

  wrapper.simulate('submit')

  expect(send).lastCalledWith('myAction', { name: 'John Doe' })
})
```

## A Test Helper

The section above describes using enzyme to frame context. We like to
keep this in a test helper to reduce boilerplate:

```javascript
import React from 'react'

// Any spy library should do, we're using Jest
export default function mockSend(send = jest.fn()) {
  send.context = { send }

  send.childContextTypes = {
    send: React.PropTypes.func
  }

  return send
}
```

Then include the helper when testing:

```javascript
import React from 'react'
import MyForm from 'somewhere'
import mockSend from '../helpers/mock-send'
import { mount } from 'enzyme'

it('broadcasts an action when submitted', function() {
  const send = mockSend()

  const wrapper = mount(<MyForm />, send)

  wrapper.simulate('submit')

  expect(send).lastCalledWith('myAction', { name: 'John Doe' })
})
```
