# Actions

Microcosm is a transactional system. Whenever an action is invoked, a transaction will be created to represent the process of resolving it.

When an transaction updates, Microcosm runs through all outstanding transactions to determine the new application state. For example, if a Promise is returned from an action, Microcosm will wait for it to resolve. The value the Promise eventually returns will then be dispatched to stores.

```javascript

function doSomething (params) {
  // These params will be forwarded to all stores
  // listening to this action
  return params
}
```

The action above is synchronous; there is no waiting involved. Parameters are immediately dispatched to stores and processed. Under the hood, the following steps occur:

1. Create a transaction for `doSomething`
2. Resolve `doSomething`; mark transaction as complete
3. Dispatch `doSomething` to stores
4. Save new state, emit change

Not all actions are synchronous. To account for this, Microcosm has the ability to process Promises.

The following example assumes a given library `ajax` which returns a Promise to represent an XHR request.

```javascript
function getPlanets(params) {
  return ajax.get('http://myapi.com/planets')
}
```

**In Microcosm, actions handle all asynchronous operations**. It will wait for the promise complete and only move a transaction forward if it resolves successfully.

What if it were to fail? If a returned Promise is rejected, the associated transaction is rejected as well. Microcosm will eliminate it from the list of valid transactions and state will be redetermined as if the transaction never occurred:

```javascript
function failure(params) {
  return Promise.reject('Nope')
}

app.push(failure, [], function(error) {
  assert.equal(error, 'Nope')
})
```

In the example above, nothing will be dispatched. Nothing will change.

## Pending state

Chat applications often implement optimistic updating. When a user sends a message, it immediately shows up on their user interface and is persisted to other clients in the background. This makes apps feel intuitive and responsive.

Functions can only return a single value. This has been fine for previous examples, however it is problematic for the scenario above.

To account for this, Microcosm uses ES6 generator functions to describe sequences of states:

```javascript
function* postMessage(params) {
  yield { ...params, pending: true }
  yield ajax.post('http://myapi.com/messages', params)
}
```

Using generators in actions brings us back to the subject of transactions. Each `yield` in the example above represents an operation in the transaction associated with a pushed `postMessage`.

First, local parameters are resolved. Stores listening to `postMessage` can add these parameters and indicate within application UI that the message has not sent yet (indiciated with `pending: true`). When the second operation is resolved, the transaction will update itself with the new operation and complete.

Since the transaction was "pending", it will be reprocessed as if the original `yield` never happened. This prevents you from needing to clean up "stale" operations.

But what if you wanted to keep the failed message and let the user resend it? Simply chain off of the promise and report the error:

```javascript
function* postMessage(params) {
  yield { ...params, pending: true }
  yield ajax.post('http://myapi.com/messages', params)
            .catch(error => { ...params, error })
}
```

By attaching the error, the user interface can give accurate feedback on the problem. Maybe the user lost their internet connection or your API returned a 500 status code.

In either case, you have flexibility in error handling. Options include:

1. **Handle the error in the callback provided in `app.push`.** State will be rolled back, but you can still alert the user.
2. **Catch a rejected promise and forward the error to stores.** This is useful if you want to persist an optimistic update and indicate something is wrong with the associated data.

## Wrapping up

This guide focused on the resolution logic surrounding actions, only touching lightly on the transactional nature of Microcosm. Future guides will provide more information on the transaction system Microcosm implements.

In the mean time, checkout the next guide on writing plugins for Microcosm. This is particularly useful for describing logic specific to a particular environment.

[Guide 4: Plugins](./04-plugins.md)
