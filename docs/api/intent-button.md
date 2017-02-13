# IntentButton

1. [Overview](#overview)
2. [Usage](#usage)
3. [Props](#props)

## Overview

IntentButton is a wrapper around a standard `button` tag that provides
a method of broadcasting an intent to associated Presenters
(see [`./presenter.md`](./presenter.md)).

```javascript
import React from 'react'
import DOM from 'react-dom'
import Presenter from 'microcosm/addons/presenter'
import IntentButton from 'microcosm/addons/intent-button'
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
      <IntentButton intent={increment} value={1}>
        {count}
      </IntentButton>
    )
  }
}

DOM.render(<CountPresenter repo={ repo } />, document.getElementById('container'))
```

When clicked, the IntentButton will invoke an intent, passing in the
provided `value` prop.

## Props

### intent

A string or action to send to Presenters. If a Presenter is registered
to that string via its `register()` method, it will execute the
associated callback. Otherwise, it gets passed up the tree of
Presenters, eventually dispatching to the associated Microcosm
instance.

### tag

Defaults to `"button"`. Indicates the HTML element `IntentButton`
should render with.

### value

The parameters that should be passed when broadcasting the provided intent.

### onClick(event, action)

An event callback executed immediately after the button clicks and the
intent is broadcasted.

### onDone(payload)

After broadcasting, if the dispatched intent returns a Microcosm
action, this callback will execute if the action completes successfully.

### onError(payload)

After broadcasting, if the dispatched intent returns a Microcosm
action, this callback will execute if the action is rejected.

### onCancel(payload)

After broadcasting, if the dispatched intent returns a Microcosm
action, this callback will execute when the action is cancelled.

### onUpdate(payload)

After broadcasting, if the dispatched intent returns a Microcosm
action, this callback will execute when the action emits a progress
update.
