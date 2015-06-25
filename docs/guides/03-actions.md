# Actions

Microcosm is a transactional system. Whenever an action is pushed into a Microcosm, an associated transaction is created to represent it. Transactions are processed sequentially, in the order in which they are pushed.

At their most basic, actions return primitive values.

```javascript
function doSomething (params) {
  // These params will be forwarded to all stores
  // listening to this action
  return params
}
```

This action is synchronous, the parameters are immediately forwarded to stores and processed. However not all actions are synchronous. To account for this, Microcosm has the ability to process Promises.

The following example uses the Promise based AJAX library [`axios`](https://github.com/mzabriskie/axios) to return a Promise representing a request information

```javascript
function getPlanets(params) {
  return axios.get('http://myapi.com/planets')
}
```

**In Microcosm, actions handle asynchronous operations**. In the
case above, Microcosm will wait for the promise complete and only dispatch if
it was resolved.

## Pending state

Some times, an action may need to resolve to "pending state". For example, a chat application that wants to optimistically update the user's UI before persisting a message elsewhere.

To do this, Microcosm uses ES6 generator functions:

```javascript
function* postMessage(params) {
	yield { ...params, pending: true }
  yield axios.post('http://myapi.com/messages', params)
}
```

Using generators in actions brings us back to the subject of transactions. In the example above, each `yield` represents an operation in the transaction associated with a pushed `postMessage`.

First, local parameters are resolved. Stores listening to `postMessage` can add these parameters and indicate within application UI that the message has not sent yet (indiciated with `pending: true`). When the second operation is resolved, the transaction will update itself with the new operation and complete.

Since the transaction was "pending", it will be reprocessed as if the original `yield` never happened. This prevents you from needing to clean up "stale" operations.
