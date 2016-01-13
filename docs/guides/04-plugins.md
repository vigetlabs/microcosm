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

  register(app, options) {
    app.listen(i => log(app.toJSON()))
  }

}

// The second argument of addPlugin contains options that will be
// sent to the plugin via the second argument of `addPlugin`:
app.addPlugin(logger, {})

// Start executes all plugins in the order in which they are added
app.start()
```

### Asynchronous plugins and Error Handling

Plugins can also be asynchronous. Providing a `next` parameter as the
third argument of the `register` function will trigger this
behavior. For example:

```javascript
let Wait = {
  register(app, options, next) {
    setTimeout(function() {
      next()
    }, 1000)
  }
}
```

When registered, this plugin will wait 1 second before advancing to
the next plugin.

This is also particularly useful for handling errors:

```javascript
let Logger = {
  register(app, options, next) {
    if ('console' in window) {
      next(new Error('console is not defined!'))
    }
    //...
  }
}
```

In the case above, `Logger` will disallow the system from starting
because it can not operate correctly. The error will be forwarded to
the callback argument of `app.start` for additional processing:

```javascript
app.addPlugin(Logger)
app.start(function(error) {
  if (error) {
    console.error("An error occurred booting the app:", error)
  }
})
```
