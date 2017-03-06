# ActionButton

1. [Overview](#overview)
2. [Usage](#usage)
3. [Props](#props)

## Overview

ActionButton is a wrapper around a standard `button` tag that provides
a method of broadcasting an action to associated Presenters
(see [`./presenter.md`](./presenter.md)).

```javascript
import React from 'react'
import DOM from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import ActionButton from 'microcosm/addons/action-button'
import Microcosm from 'microcosm'

const repo = new Microcosm()

const increaseCount = n => n

repo.addDomain('count', {
  getInitialState () {
    return 0
  },
  increase (count, amount) {
    return count + amount
  },
  register () {
    return {
      [increaseCount] : this.increase
    }
  }
})

class CountPresenter extends Presenter {
  model () {
    return {
      count : state => state.count
    }
  }

  view ({ count }) {
    return (
      <ActionButton action={increaseCount} value={1}>
        {count}
      </ActionButton>
    )
  }
}

DOM.render(<CountPresenter repo={repo} />, document.getElementById('container'))
```

When clicked, the ActionButton will invoke an action, passing in the
provided `value` prop.

## Props

### action

A string or action to send to Presenters. If a Presenter is registered
to that string via its `register()` method, it will execute the
associated callback. Otherwise, it gets passed up the tree of
Presenters, eventually dispatching to the associated Microcosm
instance.

### tag

Defaults to `"button"`. Indicates the HTML element `ActionButton`
should render with.

### value

The parameters that should be passed when broadcasting the provided action.

### onClick(event, action)

An event callback executed immediately after the button clicks and the
action is broadcasted.

### onOpen(payload)

After broadcasting, if the dispatched action returns a Microcosm
action, this callback will execute when the action opens.

### onDone(payload)

After broadcasting, if the dispatched action returns a Microcosm
action, this callback will execute if the action completes successfully.

### onError(payload)

After broadcasting, if the dispatched action returns a Microcosm
action, this callback will execute if the action is rejected.

### onCancel(payload)

After broadcasting, if the dispatched action returns a Microcosm
action, this callback will execute when the action is cancelled.

### onUpdate(payload)

After broadcasting, if the dispatched action returns a Microcosm
action, this callback will execute when the action emits a progress
update.
