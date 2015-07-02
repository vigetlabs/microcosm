# Writing Plugins

## Introduction

Plugins allow Microcosm instances to be extended with additional
functionality outside of the scope of the framework. The only
requirement is that they take the form of an object with a `register`
method:

## Designing a plugin

```javascript
let Logger = {

  log(data) {
    console.log('Change: ', data)
  },

  register(app, options, next) {
    app.listen(i => log(app.toJSON()))

    next()
  }

}

// The second argument of addPlugin contains options that will be
// sent to the plugin via the second argument of `addPlugin`:
app.addPlugin(logger, {})

// Start executes all plugins in the order in which they are added
app.start()
```

## Order of operations

When `app.start()` is called, it will execute the `register` method of
`Logger`. This provides `Logger` the ability to configure itself in a
blocking way. When `Logger` is finished configuring, it calls the
`next()` parameter provided to `register` to give preceding plugins
the opportunity to run.

## Plugins can fail

There may be cases where a runtime critical plugin will need to throw an error:

```javascript
let Logger = {
  register(app, options, next) {
    if ('console' in window) next(new Error('console is not defined!'))
    //...
  }
}
```

In the case above, `Logger` will disallow the system from starting
because it can not operate correctly. The error will be forwarded to the callback argument of `app.start` for additional processing:

```javascript
app.addPlugin(Logger)
app.start(function(error) {
  if (error) {
    console.error("An error occurred booting the app:", error)
  }
})
```
