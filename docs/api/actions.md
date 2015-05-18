# Actions

1. [Overview](#overview)
2. [Firing Actions](#firing-actions)
2. [Three ways to write actions](three-ways-to-write-actions)

## Overview

Actions shape the signals passed through Microcosm. They allow one to
prepare data before sending it to stores to be transformed into new
state.

```javascript
let MyActions = {
  doSomething(params) {
    // These params will be forwarded to all stores
    // listening to this action
    return params
  }
}
```

## Firing actions

Actions must be sent within the context of a particular instance of
Microcosm. Otherwise there would be no way to figure out
which instance of a Microcosm should change data:

```javascript
let app = new Microcosm()
app.send(MyActions.doSomething, parameters, function(error, result) {
  // an optional callback with success/failure information
})
```

## Three ways to write actions

Actions can follow three patterns.

1. [Return a value](#return-a-value)
2. [Return a promise](#return-a-promise)
3. [Error-first callback](#error-first-callback)

### Return a value

```javascript
let MyActions = {
  doSomething(params) {
    return params
  }
}
```

The simplest way to build an action is to simply return a value. This
works well if an action can not fail and is not asynchronous.

### Return a promise

```javascript
let MyActions = {
  doSomething(params) {
    return new Promise(function(resolve, reject) {
        if ('name' in params === false) {
          throw new Error('Please provide a name!')
        } else {
          resolve(params)
        }
    })
  }
}
```

**In Microcosm actions to handle asynchronous operations**. In the
case above, Microcosm will wait for the promise and only dispatch if
it was resolved.

### Error-first callback

```javascript
let MyActions = {
  doSomething(params, next) {
    if ('name' in params === false) {
      callback(new Error('Please provide a name!'))
    } else {
      callback(null, params)
    }
  }
}
```

The error-first callback style provides an alternative way to perform
asynchronous operations. In this approach, errors are sent as the
first argument of the callback and data is sent as the second
argument. This convention is followed by many JavaScript libraries and
has been added to better support them.
