# Chatbot Example

A chat application where users interact with an Elizabot chat program.

## How it works

This example demonstrates using the current state of actions to
provide optimistic updates and loading states. When an action is
pushed into a Microcosm, this example uses the `open`, `done`, and
`failed` states to display useful information to the user.

The best place to see where this happens is within
[`./app/stores/message.js`](./app/stores/message.js), where the
store's registration method listens to specific action states:

```javascript
const Messages = {
  // ..
  register() {
    return {
      [sendChat.open]    : Messages.addLoading,
      [sendChat.done]    : Messages.add,
      [sendChat.failed]  : Messages.addError
    }
  }
}
```

## What are action states?

Whenever an action creator is pushed into Microcosm, it creates an
action object to represent the resolution of that action
creator. Stores can hook into the different states of that action as the
action creator resolves. These states _loosely_ follow the
`readyState` property of `XMLHTTPRequest`:

1. **unset**: Nothing has happened yet. The action creator has not
   started.
2. **open**: The action creator has started working, such as the opening
   of an XHR request, however no response has been given.
3. **loading**: The action creator is partially complete, such as
   downloading a response from a server.
4. **done**: The action creator has resolved.
5. **cancelled**: The action was cancelled, like if an XHR request is
   aborted.
