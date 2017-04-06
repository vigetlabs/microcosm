# withSend(Component)

1. [Overview](#overview)
2. [Testing](#testing)
3. [Accessing the original component](#accessing-the-original-component)

## Overview

A higher order component that can be used to connect a component deep
within the component tree to its associated presenter. This is useful
for requesting work from Presenters where passing down callbacks as
props may otherwise be exhaustive.

```javascript
import React from 'react'
import withSend from 'microcosm/addons/with-send'

const Button = withSend(function ({ send }) {
  return (
    <button onClick={() => send('hello-world')}>
      Say hello!
    </button>
  )
})
```

```javascript
// within a Presenter:
intercept () {
  return {
    'hello-world': this.doSomething
  }
}

doSomething (repo, params) {  }
```

## Testing

`withSend` relies on the context setup by a Presenter. When testing,
this isn't always available. To work around this, Components wrapped
in `withSend` can accept `send` as a prop:

```javascript
import React from 'react'
import {mount} from 'enzyme'
import Button from 'prior-example'

describe('Button test', function () {

  it('it emits an action when clicked', function() {
    expect.assertions(1)

    function assertion (action) {
      expect(action).toEqual('hello-world')
    }

    mount(<Button send={assertion}) />
  })

})
```

## Accessing the original component

The component returned from `withSend(Component)` includes a
`WrappedComponent` property. You can use this to get access to the
original component:

```javascript
const Button = function ({ send }) {
  return (
    <button type="button" onClick={() => send('action')}>Click me</button>
  )
})

const WrappedButton = withSend(Button)

WrappedButton.WrappedComponent // Button
```
