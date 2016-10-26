# Changelog

## 10.3.0
- The `<Form />` addon can now be submited directly. (#170, #171) 

## 10.2.1

- Use correct lifecycle for subscription to repo in Presenter

## 10.2.0

- Domains can now be simple classes.
- Domain setup and teardown is now invoked with `repo` as the first
  argument.
- Presenters return the full repo state from model by default.

## 10.1.1

- Correct order of execution of model such that Presenter setup method
  runs before model calculation. This prevents cases where a domain
  may be added in the setup method, but it isn't represented in the
  initial model.

## 10.1.0

- Completed actions can no longer change. For example, resolved
  actions can not be cancelled. A cancelled action can not be
  cancelled again.
- Passing `true` as the second argument of `patch` and `reset` will
  run deserialize on provided data.
- Tag intents so that actions register the same in presenters and
  repos.

## 10.0.0

We made it! It's been a long road, but we're finally here.

This is a significant release. We've added some new tools for medium
to large applications, and made some naming convention changes to make
things more accurate to their purpose. Actions and Stores (now
Domains) also received significant upgrades.

High level list:

- All instances of `store` have been renamed to `domain`.
- All instances of `app` have been renamed to `repo`
- `Microcosm::replace` is now `Microcosm::patch`. `patch` does not
  deserialize data. `replace` is deprecated and will eventually be
  removed.
- Removed Plugins
- Removed the generator form for actions. Actions now support a thunk
  form (see [the docs](./docs/api/actions.md)).
- `repo.push` now returns the action representing the provided action
  creator.
- Added `pure` option, true by default. When true, change events
  will only fire when state is shallowly not equal.
- Microcosms can now be "forked". "Child" Microcosms receive the state
  of their parents and share the same action history, however can
  safely add new domains and make modifications to repo state without
  affecting the parent.
- Added `Presenter` add-on that replaces `Provider` and
  `Connect`. Presenters extend from React.Component and can be used to
  extract state out of a Microcosm and send it into a "passive view"
  component.
- Added `withIntent` and `form` add-on. These add-ons provide an API
  for sending messages to Presenters without needing to pass callbacks
  deeply into the component tree.

### No more plugins

Microcosm 9.x has a `start` method that must be called to begin using
it. This method sets initial state and runs through all plugins,
executing them in order.

We really liked plugins, however this extra step was cumbersome and
makes it harder to support embedding microcosms within
components. This is important for future planning, so we took
advantage of the major release to remove plugins.

We've added a `setup` method to the `Microcosm` prototype. We've found
most plugins can easily be converted into direct function calls, like:

```javascript
class Repo extends Microcosm) {
  setup () {
    plugin(this, options)
  }
}
```

### Domains (no longer called Stores)

- **Domains can no longer be functions that return a
  registration**. This wasn't being used, and makes it easier to check
  if a Store should be instantiated when added (see next item).
- Domains can now be classes. When added, they will be instantiated
  (though no parameters are currently passed to the constructor; still
  figuring this one out).
- Added a `setup` method to Domains. This is a one time lifecycle
  method that runs when a store is added to a Microcosm.
- Domains can now implement a `commit` method that indicates how a
  store should write to `repo.state`. When used with `staging`, this
  is useful for keeping complex data types internal to a Microcosm,
  exposing vanilla JS data via `repo.state`.
- Domains can now implement a `shouldCommit` method that determines if
  `commit` should run (see `docs/recipes/immutable-js.md`)

#### State management

Repo state now has two extra phases: `stage` and `commit`. Domains
handlers work against a internal staging ground. Domains can then
commit state as a separate operation.

For example, when working with ImmutableJS:

```javascript
const ImmutableDomain = {
  getInitialState() {
    return Immutable.Map()
  },

  shouldCommit(next, previous) {
    return Immutable.is(next, previous) === false
  },

  add(state, record) {
    return state.set(record.id, record)
  },

  remove(state, id) {
    return state.remove(id)
  }

  commit(state) {
    return Array.from(state.values())
  }
}
```

`shouldCommit` returns `true` by default, and `commit` just passes
along state. When warranted, these new hooks should grant a high
degree of separation between a Domain's internal data management and
the data consumed by a component tree.

### Actions

Actions have been significantly upgraded to allow for complicated
async operations.

- Actions can now be simple strings. In these cases, the first
  argument of the pushed action is forwarded to stores.
- Properly display missing action reporting when dispatching an
  undefined action.

We removed the generator form for actions. Instead, actions can return
a function to get greater control over async operations:

```javascript
function getUser (id) {
  return function (action) {
    const request = ajax('/users/' + id)

    action.open(id)

    request.on('load', (data) => action.resolve(data))

    request.on('error', (error) => action.reject(error))
  }
}
```

Domains can subscribe to these fine-grained action states:

```javascript
const UserDomain = {
  // ... handlers
  register() {
    return {
      [getUser.open]  : this.setLoading,
      [getUser.done]  : this.updateUser,
      [getUser.error] : this.setFailure
    }
  }
}
```

### Presenter Addon

We've removed the `Connect` and `Provide` addons in favor of a single
`Presenter` addon. Though the API is different (using classes instead
of higher order functions), it accomplishes the same goals.

For usage, checkout the [presenter docs](./docs/api/presenter.md)

## Changes 10.0.0 after rc11 (released in 10.0.0)

- Rename `replace` to `patch`, `patch` does not call deserialize.
- Fix proptypes on `form`
- `send` no longer raises a warning if no Presenter implements an
  intent, instead it will dispatch to Microcosm
- Prevent dispatch from accidentally triggering on Domains with the
  same method name as an action (should only be the case when
  dispatching string intents)
- Forked repos that have domains at the same key as their parents
  always handle their parent's state instead of their own.
- Added `teardown` method to Domains. Called whenever the associated
  Microcosm instance invokes `teardown`.

## 10.0.0-rc11

- Only root microcosms can replace state
- Finalize solution for Presenter issues in IE < 11 that does not
  require a polyfil.

## 10.0.0-rc10

- Fixed some edge cases in umbrella state sharing

## 10.0.0-rc9

- Almost there, we promise. We were able to identify the core issue
  behind Presenter statics not forwarding to derived classes. Those
  using Presenters should include the `Object.setPrototypeOf`
  polyfill to support IE10 and lower.

## 10.0.0-rc8

- Hoist Presenter statics for <= IE10

## 10.0.0-rc7

- Added "fork" feature to Microcosm. This method returns a new
  Microcosm that shares the same history tree the original and will
  receive the parent's state, however does not share domains.
- Presenters fork their given repo by default.
- Renamed `action.close()` to `action.resolve()`

## 10.0.0-rc6

- Flipped `shouldCommit`'s signature to `shouldCommit(last, next)` to
  be consistent with other store methods.
- Added `Presenter::teardown`, the opposite of `Presenter::setup`
- Added back `Microcosm::append` and made it a public API. It's simply
  too useful for testing.

## 10.0.0-rc5

- Do not execute callbacks in event listeners when another callback
  unsubscribes them.

## 10.0.0-rc4

- `replace` works as advertised. Merge data into existing state.

## 10.0.0-rc3

- Added `view` method and `model` alias for `viewModel` on Presenter.

## 10.0.0-rc2

- Fixed a bug where the presenter's subscription would be removed when
  children unmounted.

## 10.0.0-rc

- Removed `Microcosm::append`. This was only used internally, and is
  no longer necessary.
- Updated Presenter to take advantage of scope management in event
  emitter.
- Renamed the `failed` action state to `error` to be consistent with
  `Action::onError` and the `error` event listener trigger.
- Added a new `withIntent` addon. See [the docs for more info](./docs/api/with-intent)
- All instances of `store` have been renamed to `domain`.

### Upgrading

- Instead of calling `repo.addStore`, call `repo.addDomain`. We've
  kept `addStore` temporarily to make upgrading easier, but will
  remove it with the 10.0.0 release.
- Rename all `failed` subscriptions in Domain register methods to
  `error`.

## 10.0.0-beta-8

- Call action callbacks with provided scope (bug fix)
- Do not use a getter to compute type, just calculate it
  once when state changes. This also provides a small perf boost.

## 10.0.0-beta7

- Throw an error before attempting to tag `null` or `undefined`
- Warn if `Presenter::viewModel` returns `repo.state` directly, allow
  `viewModel` to return a function similar to an individual key/value
  binding.
- Add `onCancel` event to actions (returned from
  `repo.push()`). Thanks @djmccormick!
- Presenter no longer throws an error if no render method is
  implemented, instead it just passes along children (when it can)
- Removed Connect and Provider addons. The Presenter accommodates both
  uses cases.

## 10.0.0-beta6

Couple of bug fixes:

- Presenter setup needs to happen in `componentWillMount`, otherwise React warns
  when setState is called in a constructor.
- Cut some unused, undocumented methods from the base Emitter class.
- Ensure there is always a "last" state when executing `shouldCommit` in stores.

## 10.0.0-beta5

Almost there. This is an important revision. Any new changes after
this should focus primarily API design (what do we call stuff?).

### Microcosm

- Added `pure` option, true by default. When true, change events
  will only fire when state is shallowly not equal.
- Repo state now has an extra phase: `staging`. Stores can implement a
  `stage` method to determine how to write state to `staging`,

### Stores

- **Stores can no longer be functions that return a
  registration**. This wasn't being used, and makes it easier to check
  if a Store should be instantiated when added (see next item).
- Stores can now be classes. When added, they will be
  instantiated (though no parameters are currently passed to the
  constructor; still figuring this one out).
- Added a `setup` method to Stores. This is a one time lifecycle
  method that runs when a store is added to a Microcosm.
- Stores can now implement a `commit` method that indicates how a
  store should write to `repo.state`. When used with `staging`, this
  is useful for keeping complex data types internal to a Microcosm,
  exposing vanilla JS data via `repo.state`.
- Stores can now implement a `shouldCommit` method that determines if
  `commit` should run (see `docs/recipes/immutable-js.md`)

### Presenter Addon

- Added `setup` method. This is a one time lifecycle method that
  eliminates the need to crack open the constructor, and should be
  consistent with Microcosm.
- Presenters inherit `pure` from their provided repo. This behaves
  similarly to Microcosm's pure, only on the `viewModel`.

## 10.0.0-beta4

- Presenters (and Connect) now except non-function values as computed properties
- Presenters expose intents via a `register()` method (similarly to Stores)
- Removed faulty missing action error (added in beta3). Reduced some errors to
  warnings.
- Improved efficiency of some internal state tree operations

## 10.0.0-beta3

- Actions can now be simple strings. In these cases, the first
  argument of the pushed action is forwarded to stores.
- Properly display missing action reporting when dispatching an
  undefined action.
- References to `app` are now `repo`

## 9.21.0

- The history tree now uses its nodes as linked lists to calculate
  children instead of allocation an array.
    - This results in about a 60% reduction in memory usage.
- Added `children` getter to Tree Node class.
- Updated some development-only validation errors and worked around a
  silly React Native bug with using `import` statements in comments.

## 9.20.0

This update contains internal updates that were substantial enough to
warrant a minor release. There should be no breaking changes, but
actions and plugins have been improved in ways that may affect your
app.

### Noticeable changes

- Microcosm will now bail-out early if pushing an action before it is
  started.
- Eliminated possible cases where promises trapped errors
- Drastic performance increase

#### Bailing out early

A Microcosm must be started via `app.start()` before pushing
actions. With this release, it will now throw an error when this is
not the case. **When upgrading, ensure that `app.start()` is being
called before booting your application.**

#### Promises

Before this release, the try/catch block that Promises use to identify
rejections would also extend to internal Microcosm operations... and
eventually React components subscribing to updates. This meant that it
was possible for errors thrown by Stores and React components to be
caught by Promises.

This is typically what you sign up for with Promises, however there is
a very clear stopping point within Microcosm where it simply needs the
value returned from a Promise. There is no additional value in
continuing on with the Promise behavior, only hindrance. In this
release we've added an escape hatch at that specific part of the
lifecycle to untrap errors after that point.

This should only make working with Promises much more pleasant, and we
do not anticipate it affecting the way you use Microcosm. Still, it is
possible that your app does not properly handle errors from
Promises. **When upgrading, you should confirm this for all actions
that rely on Promises.**

#### Performance

Microcosm **dispatches are roughly 1200% faster** (depending on the number
of stores, and event subscriptions).

Much of this is attributed to changes in the Tree data structure used
to keep track of state. Specific actions, such as retrieving the root
and size of the tree occur in constant time. Additionally action
handlers are now memoized to prevent wasteful calls to Store
`register` methods.

These changes have also resulted in tremendously lower memory usage.

## 9.19.1

- Fixes a regression introduced in 9.6.0 where the promise payload was
  not being returned from push, this prevented promise chains from
  receiving the transaction payload.

## 9.19.0

- Added Provider and Connect addons. See the API docs for more
  information and checkout the newly updated ReactRouter example.

## 9.18.0

- When registered, the `options` argument of plugins default to an
  empty object.
- Added warning when a Store's registration method is configured to
  listen to a particular action, however it is undefined. The message
  should read "Store for [key] is registered to [action], but the
  handler is undefined!"
- Upgraded patch release of Diode that fixed strange compilation
  issues with Babel 5.x in a Node environment.

## 9.17.0

Plugins no longer require a `next` argument. For example, consider:

```javascript
function Plugin (app, options, next) {
  app.listen(function() {
    console.log("I changed!")
  })

  next()
}
```

This plugin is entirely synchronous, yet relies on `next()` to advance
plugin installation forward. As of this release, omitting the `next`
argument causes a plugin to be synchronously processed:

```javascript
function Plugin (app, options) {
  app.listen(function() {
    console.log("I changed!")
  })
}
```

**This is not mandatory**, and designed to streamline simple plugins.

## 9.16.0

- The history tree now properly implements "redo". Before this
  release, moving forward in the tree would walk the oldest
  branch. From this point forward, it will take the newest path. This
  should not impact projects not utilizing undo history.

## 9.15.2

- Republish to set to latest

## 9.15.1

- Removes extraneous dependency

## 9.15.0

- Fix bug where history would not completely flush all transactions,
  causing store handlers to fire twice.
- `start()` must be invoked

### Potentially breaking changes

In a previous update, we made a change that allowed instances of
microcosm to work without invoking `start()`. This update reverts that
decision. Without intentionaly invoking start, transactional state
becomes hard to predict. This is potentially a breaking change; for
those upgrading, verify that you are calling `start` before using a
microcosm.

## 9.14.1

- Properly clear history so that store handlers do not fire twice

## 9.14.0

### Noticeable Changes

We improved the validation of stores to help improve debugging of
bad inputs to `Microcosm::addStore`.

### Internal Changes

- Small change to dispatch process so that accessing state only
  happens when necessary. This should provide a small performance
  boost.

## 9.13.1

- Addressed an IE9 bug where stores passed without key paths did not
  install properly.

## 9.13.0

### Noticeable Changes

- `Microcosm::addStore` mounts stores to a given key path, like:
  `app.addStore([ 'path', 'to', 'key' ], Store)`. Additionally, adding
  a store without a keypath will mount it to the entire application
  state. This is to improve the useability of Stores that must operate
  all state (such as make decisions about game state).
- Renamed `setFocus` to `checkout` in internal Tree structure. **This
  is a breaking change.** The goal is to move towards a more intuitive
  API.
- Tweaked build process to prevent babel compilation errors when
  developing for React Native development.

### Upgrading

The enhancement `Microcosm::addStore` is not a breaking change, all
old use cases will continue to work.

Those experimenting with `app.history` will need to rename calls to
`setFocus` to `checkout`.

## 9.12.0

This is a big update, however there should be no breaking changes
(assuming you are not referencing Microcosm internals).

### Noticeable Changes

- Microcosm now stores transactions created by actions as a tree. The
  long term plan for this change is to support undo trees.
- Stores determine initial state when they are added to a
  Microcosm. This allows for Microcosms to be created without needing
  to `start()`.
- Added history API. This is an unstable API. However, for those
  curious, check out the undo-tree example.
- Added some additional validations to ensure proper use of Microcosm.
- Actions that are generators now receive the last payload as the
  returned value from `yield`. This should help to improve sequential,
  daisy chained, calls.
- Adjusted build tooling to expose Microcosm modules at `microcosm/*`
  instead of `microcosm/src/*`
- Stores and Plugins can now be functions. When this is the case, they
  will act as the `register` function in each instance.

### Internal Changes

- Adjustments to improve v8 performance. All Microcosm operations
  should occur without deoptimization penalties.

### Upgrading

For those referencing Microcosm internals, we have moved their hosted
directory from `src` to the folder root. This means the following
changes are necessary:

Instead of:

```
require('microcosm/src/lifecycle')
```

Change this to:

```
require('microcosm/lifecycle')
```

## 9.11.0

### Noticeable Changes

- Generators used for Microcosm actions can now yield other
  generators. In these instances, child generators operate to
  completion before the next iteration of the parent generator.

## 9.10.0

### Noticeable Changes

- Upgrade Diode to 6.1.0. `listen` now supports a second argument that
  defines the scope of the callback.
- Respect scope of bound functions when executing callbacks via `app.push`

## 9.9.2

### Internal changes

- Fixed bug where `eventually` would try to execute a non-function value

## 9.9.1

### Noticeable changes

- Improved the error messages for `addStore`

### Internal changes

- Changed order of execution in `tag` to prevent unnecessary work

## 9.9.0

### Noticeable changes

- Each store will receive the reduced state from all prior
  stores. This means that stores can respond to the result from prior
  operations. This should not affect any stores that do not access the
  third argument of store callbacks (all application state).

### Internal changes

- Rewrites and improvements to `dispatch` and `send` methods to
  achieve higher v8 optimization.

## 9.8.0

### Noticeable changes

- If a store returns undefined, no state change will occur. This is
  potentially a breaking change. If you have stores that return
  `undefined`, consider changing your logic to support returning `null`

## 9.7.0

- The third argument of store callbacks now contains all application
  state. The intention behind this addition is to allow for stores
  that must make decisions based upon input from multiple sources.

## 9.6.0

### Noticeable changes

- The `deserialize` lifecycle method is now provided the entire raw
  state as the action parameters. This means that it is now available
  as the second argument in store callbacks.
- Similarly, the `serialize` lifecycle method is now provided the
  entire app state in the action. This means that it is now available
  as the second argument in store callbacks.

### Internal changes

- Tweaks to lazy callback executed after `app.push` for better
  optimization
- Tweaks to `flatten` for better optimization
- Renamed `async` utility to `coroutine`
- Reworked transactions to expose future lifecycle methods
- Retain 100% test coverage

### Upgrading

There are no breaking changes for this release.

## 9.5.0

- Upgrade dependencies
- Use fixed versions for dependencies

## 9.4.1

### Internal changes

- Fixed bug where lifecycle methods used as registered actions did not
  properly stringify.

## 9.4.0

### Noticeable changes

- Exposed lifecycle actions under `microcosm/lifecycle`. See the
  upgrading section for more notes.

### Internal changes

- `getInitialState`, `serialize`, and `deserialize` are now triggered
  by actions. We call them _lifecycle actions_. Their associated
  counterparts are `willStart`, `willSerialize`, and
  `willDeserialize`. There is no obligation to use these lifecycle
  actions, the store methods should work all the same.

### Upgrading

This version adds lifecycle actions. This does not make any breaking
change to the Microcosm API, however it provides us better internal
consistency.

These lifecycle actions are still undergoing development (names may
change, etc, but we'll keep you posted). However if you would like to
give them a spin, consider the following code example:

```javascript
import { willStart } from 'microcosm/lifecycle'
import { addPlanet } from 'actions/planets'

const Planets = {
  reset() {
    return []
  },
  add(records, item) {
    return records.concat(item)
  },
  register() {
    return {
      [willStart] : Planets.reset,
      [addPlanet] : Planets.add
    }
  }
}
```

## 9.3.0

### Noticeable changes

- Store registration methods can return non-function values. When this
  is the case, it will use this value as the new state.

## 9.2.0

### Noticeable changes

- Plugins will now validate that their `register` property is a
  function. If this property is not present, it will skip this
  validation and continue to the next plugin.

### Internal changes

- Internalized `is-generator` package to reduce dependencies and cut
  some dead code.
- Refactored the install process to prevent needless extension and
  simplify the installation queue.

### Upgrading

All changes are purely internal polish. There should be no additional
required action. The build is about 100 bytes smaller, but who's
counting? :)

## 9.1.0

### Internal changes

- Updates to the way transactions are created and rolled forward to improve
  efifciency and support dev tool development

## 9.0.0

### Noticeable changes

- Microcosm now uses transactions to process state. When an action is pushed,
  an associated transaction will be created. Transactions are processed in the
  order in which `app.push` is called.
- Added a mechanism for optimistic updates using generators in actions.
- `app.push` accepts a callback as the third argument which will be invoked when an action is completely resolved (More in breaking changes)

### Breaking Changes

- Removed Foliage. Microcosm no longer extends from Foliage and its API is no longer available.
- Instead of `app.get` or `app.toObject()` to retrieve state, use `app.state`.
- The signature for `app.push` is now `app.push(action, [...arguments], callback)`.
- The signature for `app.prepare` is now `app.prepare(action, [...arguments])`.

### Upgrading

#### Foliage

For those using the Foliage API, consider using Foliage within Stores themselves.

#### app.push

`app.push` should continue to work as expected when only one parameter is pushed to an action, however those pushing multiple parameters should make the following change:

```
// Before:
app.push(action, 'one', 'two',' 'three')
// After:
app.push(action, ['one' ,'two', 'three'])
```

Additionally, the third argument of `app.push` is now an error-first callback.
When an action resolves or fails, it will execute this callback:

```javascript
app.push(action, params, function(error, body) {
  if (error) {
    handleError(error)
  }
})
```

#### Getting app state

All instances of `app.get('key')` should be replaced with `app.state.key`, sort of like
if it were a React Component

## 8.3.0

### Breaking changes

- Microcosm will emit events synchronously.

### Upgrading

In the past, Microcosm would use requestAnimationFrame to batch together changes. However this can cause unexpected consequences when sequentially performing otherwise synchronous operations. For those who wish to preserve this behavior, consider using debounce to "choke" high frequency changes.

## 8.2.0

### Internal Changes

- Upgrade Foliage to `0.24.0`.
- Moved `Store.prototype.send` to `Store.send`. This has always been
  an internal API, however those using this method for testing will
  need to update. This change is motivated by a desire to reduce as
  much surface area from Store instances as possible.
- We now use `babel-plugin-object-assign` for extension
- Microcosm is compiled in normal babel mode (not loose)

### Fixes

- Store responses to actions will always be called within the scope of the store.
- Addressed classical inheritance issue not caught from `loose` babel compilation

### Upgrading

For those using `Store.prototype.send`, the following change is
necessary:

```javascript
// Before
store.send(state, action, payload)
// After
Store.send(store, action, state, payload)
```

## 8.1.0

### Noticeable changes

- Stores no longer return `this` from `register()` by default. **This is
  a potentially breaking change**, however should not pose a problem to
  projects using idiomatic Store registration.
- Scope of store reducers when dispatching will always be the Store

### Internal Changes

- Added plugin class to manage defaults
- `tag` now includes the name of the function in `toString()`
- Unique ids for plugins and actions are internally generated with
  counters

## 8.0.0

### Noticeable changes

- Stores now contain the logic for how it should receive an action.
  logic is contained under `send`.
- Stores now contain the logic to determine what method should resolve
  an action sent to it. This is defined in `register`
- `Microcosm::deserialize` will now only operate on the keys provided
  by the seed object. This means that data passed into `replace`
  will only blow way keys provided in the data object.
- The signaling logic for dispatching actions will throw an error if
  the action provided is not a function
- Internalized tag, it will now lazy evaluate as actions are fired
- Upgraded Foliage, Microcosm now contains `subscribe`, `unsubscribe`, and `publish` aliases for `listen`, `ignore`, and `publish`

### Breaking Changes

- Remove all uses of the `tag` module.

#### Changes to Stores

Before this release, stores would listen to actions using the
stringified value of their functions:

```javascript
var MyStore = {
  [Action.add](state, params){}
}
```

This was terse, however required actions to be tagged with a special
helper method. It also required any module that needed access to a
Store's method to also know what actions it implemented.

To address these concerns, Stores now communicate with a Microcosm
using the `register` method:

```javascript
var MyStore = {
  register() {
    return {
      [Action.add]: this.add
    }
  },
  add(state, params){}
}
```

Under the hood, Microcosm tags functions automatically.

## 7.1.1

- Bumped Foliage to a newer version

## 7.1.0

### Noticeable changes

- `Microcosm::start` will return itself

### Internal improvements

- Replaced all uses of ES6 modules with CommonJS. This was causing
  issues in non-ES6 module projects.
- Microcosm publishes as separate modules now. Ideally, this will make
  internal pieces easier to reuse and help with debugging.

## 7.0.0

- Internally, Microcosm now uses
  [Foliage](https://github.com/vigetlabs/foliage) for state
  management.
- `pull` is now `get`, as it is inherited from Foliage
- Microcosm is actually an extension of Foliage, so it now includes
  all Foliage methods.
- Microcosm no longer uses toString() to get the key for Stores. This
  was decided upon so that it is easier to reason about what a Store
  is responsible for when hooking it into a Microcosm.

## 6.2.1

- Externalize some methods to fix extension

## 6.2.0

- Microcosm's event system has been replaced with
  [Diode](https://github.com/vigetlabs/diode). The APIs are the
  same. This should not lead to any breaking changes.

## 6.1.0

- `Microcosm::pull` can now accept an array of keys for the first
  argument. This will traverse the nested keys of state to calculate value.

## 6.0.0

6.0.0 is the second effort to reduce the surface area of the Microcosm API.

- Removed `Upstream` and `Downstream` mixins. They used the
  undocumented context API and introduced some complexity in testing
- `Microcosm::send` is now `Microcosm::push`
- `Microcosm::push` is now `Microcosm::replace`
- `Microcosm::dispatch` and `Microcosm::commit` are now private. These
  are important methods that should not be overridden

## 5.2.0

- `Microcosm::pull` accepts a callback that allows you to modify the
result. This should help to make data queries more terse.
- Removed `Microcosm::clone`, the functionality is not gone, but it
  has been internalized to mitigate the cost of future changes
- Removed mixins from main payload to improve size

## 5.1.1

- Fix build process mistake :-/

## 5.1.0

- Removed fallback from `Microcosm::pull` which returns all state
- Added an `Upstream` and `Downstream` mixin, however it is
  experimental. More details will come as the feature develops.
- `Microcosm::send` will throw an error if given an undefined
  action parameter

## 5.0.0

Version 5 represents an attempt to address some growth pains from
rapidly adding new features to Microcosm. Names have been changed to
improve consistency and internal APIs have been refactored. The
overall surface area of the app has been reduced and more opinions have
been made.

- Renamed `Microcosm::seed` to `Microcosm::push`
- Renamed `Microcosm::get` to `Microcosm::pull`
- Removed `Microcosm::has`
- Removed `Microcosm::getInitialState`. the `Store` API still provides
  this function, however it is the expectation of the system that
  value of state is a primitive object. This is so that Microcosm
  always knows how to smartly clone its state, regardless of if
  another data library is used for its values.
- Removed `Microcosm::swap`, this was an internal API that is no
  longer required
- Renamed `Microcosm::reset` to `Microcosm::commit`
- Removed `Microcosm::shouldUpdate`. If no stores respond to an
  action, a change event will not fire anyway. Placing this concern in
  the view layer keeps React's `shouldComponentUpdate` as the single
  responsibility for this task.
- Added `Microcosm::toObject`
- Internal function `mapBy` has been renamed to `remap`. It now
  operates primarily upon objects.
- `Microcosm::pump` is now `Microcosm::emit`, this is to better match
  existing event emitter libraries (including the one in Node's
  standard library)

As an additional illustration, the Microcosm API has been logistically
sorted within `./cheatsheet.md`

## 4.0.0

- Added concept of plugins. Plugins provide a way to layer on
  additional functionality. This has specifically been added so that
  environment specific behavior may be added to an app.
- Added `Microcosm::start`. Calling `start()` will bootstrap initial
  state, run all plugins, then execute a callback.

## 3.3.0

- `mapBy` internal function now accepts an initial value
- Changed `Microcosm::dispatch` copy strategy. Instead of merging a
  change set, it now directly modifies a clone of the previous
  state.
- Added `Microcosm::clone`. This method defines how state is copied
  before dispatching an action.

## 3.2.0

- Changed default shouldUpdate algorithm

## 3.1.0

- `Microcosm::getInitialState()` now accepts an `options`
  argument. This argument is passed down from the constructor.

## 3.0.0

- Changed data update pattern to more closely match
  [Om](https://github.com/omcljs/om/wiki/Basic-Tutorial). This means
  that `Microcosm::merge` has been replaced with
  `Microcosm::swap`. Additionally, `Microcosm::reset` has been added
  to completely obliterate old state.
- `Microcosm::addStore` now only accepts one store at a time. It was
  not being utilized, gives poorer error handling, and makes let less
  clear the order in which Stores will process data.
- The internal class `Heartbeat` was replaced with `pulse`. Pulse is a
  function that can act as a factory or decorator. When given an
  argument, it extends an object with emitter functionality, otherwise
  it returns a new object that implements the same API. This
  eliminates the possibility that the private `_callbacks` member of
  `Heartbeat` was overridden. It also reduces the use of classical
  inheritance, which yields some minor file size benefits by
  polyfilling less of the `class` API.

## 2.0.1

- Fix issue where empty arguments would break deserialize

## 2.0.0

- Replace default `Microcosm::send` currying with partial application
  using `Microcosm::prepare`
- Throw an error if a store is added that does not have a unique identifier
- `Microcosm::set` has been replaced with `Microcosm::merge`, so far
  `set` has only been used internally to `Microcosm` and `merge` dries
  a couple of things up

### More info on removing currying

Currying has been removed `Microcosm::send`. This was overly clever
and somewhat malicious. If an action has default arguments, JavaScript
has no way (to my knowledge) of communicating it. One (me) could get into a
situation where it is unclear why an action has not fired properly
(insufficient arguments when expecting fallback defaults).

In a language without static typing, this can be particularly hard to debug.

In most cases, partial application is sufficient. In light of this,
actions can be "buffered up" up with `Microcosm::prepare`:

```javascript
// Old
let curried = app.send(Action)

// New
let partial = app.prepare(Action)
```

`Microcosm::prepare` is basically just `fn.bind()` under the
hood. Actions should not use context whatsoever, so this should be a
reasonable caveat.

## 1.4.0

- `Store.deserialize` returns the result of `getInitialState` if no
  state is given
- Added `Microcosm.swap` to perform diffing and emission on change
- `Microcosm.seed` will now trigger a change event
- `Heartbeat.js` now invokes callbacks with `callback.call(this)`

## 1.3.0

- Microcosms will `set` the result of `getInitialState` when adding a store
- Microcosms will execute `deserialize` on stores when running `seed`
- Adding a store will now fold its properties on top of a default set
  of options. See `./src/Store.js` for details.

## 1.2.1

- Fix bug introduced with Tag by exposing ES6 module

## 1.2.0

- All stores can implement a `serialize` method which allows them to
  shape how app state is serialized to JSON.

## 1.1.0

- Better seeding. Added `Microcosm::seed` which accepts an
object. For each known key, Microcosm will the associated store's
`getInitialState` function and set the returned value.
- Exposed `Microcosm::getInitialState` to configure the starting value
  of the instance. This is useful for those wishing to use the
  `immutable` npm package by Facebook.
- Microcosm will not emit changes on dispatch unless the new state
  fails a shallow equality check. This can be configured with
  `Microcosm::shouldUpdate`
- `Microcosm::send` is now curried.

## 1.0.0

This version adds many breaking changes to better support other
libraries such as
[Colonel Kurtz](https://github.com/vigetlabs/colonel-kurtz) and [Ars
Arsenal](https://github.com/vigetlabs/ars-arsenal).

In summary, these changes are an effort to alleviate the cumbersome
nature of managing unique instances of Actions and Stores for each
Microcosm instance. 1.0.0 moves away from this, instead relying on
pure functions which an individual instance uses to operate upon a
global state object.

- Actions must now be tagged with `microcosm/tag`. For the time being,
  this is to provide a unique identifier to each Action. It would be
  nice in future versions to figure out a way to utilize `WeakMap`.
- Stores are plain objects, no longer inheriting from `Store` base
  class.
- Stores must implement a `toString` method which returns a unique id.
- State for a store must now be accessed with: `microcosm.get(Store)`
- Microcosms no longer require `addActions`, actions are fired with
  `microcosm.send(Action, params)`
- Removed `Microscope` container component. Just use `listen`

## 0.2.0

- Remove `get all()` from `Store`. This is to reduce namespace collisions. Stores should define their own getters.

## 0.1.0

- Added a `pump` method to `Microcosm` instances. This exposes the heartbeat used to propagate change.
