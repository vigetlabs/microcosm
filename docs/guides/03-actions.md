# Actions

Microcosm is a transactional system. When an action is pushed into a Microcosm it creates a transaction to represent it.

At their most basic, actions return primitive values.

```javascript
function doSomething (params) {
  // These params will be forwarded to all stores
  // listening to this action
  return params
}
```

The action creator above is synchronous. Parameters are immediately forwarded to stores and processed.

Not all action creators are synchronous. To account for this, Microcosm has the ability to process Promises.

The following example assumes a given library `ajax` which returns a Promise to represent an XHR request.

```javascript
function getPlanets(params) {
  return ajax.get('http://myapi.com/planets')
}
```

**In Microcosm, actions handle all asynchronous operations**. It will wait for the promise complete and only move a transaction forward if it resolves successfully.

## Pending state

An action may need to resolve to "pending state". For example, many chat applications optimistically update a user's interface before persisting it and forwarding the message to other clients.

This sort of behavior is problematic to in the context of previous examples. Traditionally functions only return a single value.

To get around this, Microcosm uses ES6 generator functions:

```javascript
function* postMessage(params) {
  yield { ...params, pending: true }
  yield ajax.post('http://myapi.com/messages', params)
}
```

Using generators in actions brings us back to the subject of transactions. Each `yield` in the example above represents an operation in the transaction associated with a pushed `postMessage`.

First, local parameters are resolved. Stores listening to `postMessage` can add these parameters and indicate within application UI that the message has not sent yet (indiciated with `pending: true`). When the second operation is resolved, the transaction will update itself with the new operation and complete.

Since the transaction was "pending", it will be reprocessed as if the original `yield` never happened. This prevents you from needing to clean up "stale" operations.

## Wrapping up

This guide focused on the resolution logic surrounding actions, only touching lightly on the transactional nature of Microcosm. Future guides will provide more information on the transaction system Microcosm implements.

In the mean time, checkout the next guide on writing plugins for Microcosm. This is particularly useful for describing logic specific to a particular environment.

[Guide 4: Plugins](./04-plugins.md)
