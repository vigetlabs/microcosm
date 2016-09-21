# Actions

Microcosm is a transactional system. Whenever an action creator is
invoked, an action will be created to represent the process of
resolving it.

When an action updates, Microcosm runs through all outstanding
actions to determine the new repo state. For example, if a
Promise is returned from an action, Microcosm will wait for it to
resolve. The value the Promise eventually returns will then be
dispatched to stores.

```javascript

function doSomething (params) {
  // These params will be forwarded to all stores
  // listening to this action
  return params
}
```

The action above is synchronous; there is no waiting
involved. Parameters are immediately dispatched to stores and
processed. Under the hood, the following steps occur:

1. Create an action for `doSomething`
2. Resolve `doSomething`; mark action as complete
3. Dispatch `doSomething` to stores
4. Save new state, emit change

Not all actions are synchronous. To account for this, Microcosm has
the ability to process Promises.

The following example assumes a given library `ajax` which returns a
Promise to represent an XHR request.

```javascript
function getPlanets (params) {
  return ajax.get('http://myapi.com/planets')
}
```

**In Microcosm, actions handle all asynchronous operations**. It will
wait for the promise complete and only move an action forward if
it resolves successfully.

What if it were to fail? If a returned Promise is rejected, the
associated action moves into a `error` state. This can be subscribed
to within stores:

```javascript
function getPlanet (id) {
  return ajax.get('http://myapi.com/planets/' + id)
}

const Store = {
  // ...
  register() {
    return {
      [getPlanet.done]  : Store.updatePlanet,
      [getPlanet.error] : Store.handleError
    }
  }
}

// let's assume the ajax request fails
repo.push(getPlanet, 2)
```

## Pending state

Chat applications often implement optimistic updating. When a user
sends a message, it immediately shows up on their user interface and
is persisted to other clients in the background. This makes apps feel
intuitive and responsive.

Up until now, we've only dealt with an action's `done` and `error`
state. However, when returning Promises, actions switch into an `open`
state while it waites for the Promise to resolve. This can also be
subscribed to within a store:

```javascript
const Store = {
  // ...
  register() {
    return {
      [getPlanet.open]  : Store.setLoading,
      [getPlanet.done]  : Store.updatePlanet,
      [getPlanet.error] : Store.handleError
    }
  }
}
```

## Wrapping up

That's it! This concludes the guide. From here, checkout the examples
for additional patterns and browse through the API documentation.
