# Plugins

1. [Overview](#overview)
2. [Making a plugin](#making-a-plugin)
3. [Handling failure](#handling-failure)

## Overview

Plugins provide a couple of valuable features to Microcosm:

1. **Side-effects**. Plugins are a great place to handle things like
saving global state to localStorage or syncing with a service like
Firebase.
2. **Bootstrapping**. Microcosm blocks initializing until a `next()`
callback is executed by a plugin. This allows apps to fetch data ahead
of time or establish a web socket connection.
3. **Monitoring**. Plugins provide a great way to "jack-in" to an
application and listen for particular events to occur.

## Making a plugin

Plugins are inspired by the API provided by
[HapiJS](hapijs.com). Future version of Microcosm will aspire for
greater
adherence to the Hapi API to help share code and provide consistency.

At the moment, the only requirement is that plugins implement a
`register` method:

```javascript
let LazyPlugin = {
  register(app, options, next) {
    setTimeout(next, 2000);
  }
}
```

This plugin will delay execution of the app for 2 seconds. This
expresses the nature of plugins. They can be asynchronous, to support
non-immediate (but vital) tasks:

For example: What if you want to fetch data before an application begins?

```javascript
import Route from 'stores/route'

let Prefetcher = {
  register(app, options, next) {
    let route = app.get(Route)

    route.fetchData()
         .then(app.seed)
         .then(i => next)
  }
}
```

## Handling failure

Plugins can fail, for example what if fetching data returns a 500? The
`next` function accepts an `error` argument:

```javascript
import Route from 'stores/route'

let Prefetcher = {
  register(app, options, next) {
    let route = app.get(Route)

    route.fetchData()
         .then(app.seed)
         .then(i => next)
         .catch(error => next(error))
  }
}
```

This will throw an error (and it will not be caught). You can handle
this however you wish.
