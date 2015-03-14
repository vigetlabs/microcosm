# Microcosm

Microcosm is Pearl's private implementation of
[isomorphic](http://artsy.github.io/blog/2013/11/30/rendering-on-the-server-and-client-in-node-dot-js/)
[Flux](facebook.github.io/flux). Specifically, it addresses the
problem of isolating state between requests so that each page render
does not leak information into the next.

## Opinions

Microcosm injects a couple of opinions regarding the Flux
architecture:

1. Typically Flux uses CONSTANT values to pass messages from Actions
   to Stores. Microcosm automatically generates these based upon the
   method names and registered identifiers of Action entities (more on
   this later).
2. Microcosm expects immutability. Stores change state by reassigning
   the `state` property. This property is a setter, which will trigger
   an event if the object reference provided to it is different.
3. All Actions return promises when called. This allows error
   validation for Pearl's forms and easy prefetching of information
   when rendering on the server.

## How Actions work

Actions are simple objects that are registered by a Microcosm:

``` javascript
let Messages = {
  create(message) {
    return { message, time: new Date() }
  }
}
```

They are registered within the constructor function of a Microcosm

```javascript
class App extends Microcosm {
  constructor(seed) {
    super(seed)

    this.addActions({
      messages: Messages
    })
  }
}
```

`addActions` will expose a version of `Messages` where each method has
been wrapped with the required logic to queue actions in the
system. In this case, they will be exposed like:

```javascript
let app = new App()

app.actions.messages //=> { create }
```

## How Stores work

A Store must extend from the Microcosm Store class:

```javascript

class Messages extends Store {
  getInitialState(seed) {
    return []
  }

  register(constants) {
    return {
      [constants.messages.create]: this.add
    }
  }

  add(params) {
    this.state = this.state.concat(params)
  }
}
```

A couple of notes here. `getInitialState`, much like within a React
component, determines the initial state of the Store when a Microcosm
is instantiated. `register` tells Microcosm what actions the Store can
listen to. Finally, updating state occurs through assignment.

Similarly to Actions, Stores must be registered:

```javascript
class App extends Microcosm {
  constructor(seed) {
    super(seed)

    this.addStores({
      messages: Messages
    })
  }
}
```

## Change propagation

Every time an action is dispatched, it will then emit a change event
on the Microcosm instance. The `Microscope` mixin can be used to update
state for components that need to query stores:

```javascript
import React      from 'react'
import Microscope from 'microcosm/microscope'

let MessagesList = React.createClass({
  render() {
    return (
      <Microscope watch={[ 'messages' ]}>
        <Component>This component will get a message prop.</Component>
      </Microscope>
    )
  }
})
```

## Additional Notes

The philosophy behind change management is described very well in the
[Advanced Performance](http://facebook.github.io/react/docs/advanced-performance.html)
section of the React docs.
