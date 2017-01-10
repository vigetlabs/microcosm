# withIntent(Component)

1. [Overview](#overview)
2. [Testing](#testing)

## Overview

A higher order component that can be used to connect a component deep
within the component tree to its associated presenter. This is useful
for requesting work from Presenters where passing down callbacks as
props may otherwise be exhaustive.

```javascript
import React from 'react'
import withIntent from 'microcosm/addons/with-intent'

const Button = withIntent(function ({ send }) {
  return (
    <button onClick={() => send('hello-world')}>
      Say hello!
    </button>
  )
})
```

```javascript
// within a Presenter:
register () {
  return {
    'hello-world': this.doSomething
  }
}

doSomething (repo, params) {  }
```

## Testing

`withIntent` relies on the context setup by a Presenter. When testing,
this isn't always available. To work around this, Components wrapped
in `withIntent` can accept `send` as a prop:

```javascript
import React from 'react'
import test from 'ava'
import {mount} from 'enzyme'
import Button from 'prior-example'

test('it emits an intent when clicked', assert => {
  assert.plan(1)

  function assertion (intent) {
    assert.is(intent, 'hello-world')
  }

  mount(<Button send={assertion}) />
})
```
