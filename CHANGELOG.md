# Changelog

### 1.1.0

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

### 1.0.0

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

### 0.2.0

- Remove `get all()` from `Store`. This is to reduce namespace collisions. Stores should define their own getters.

### 0.1.0

- Added a `pump` method to `Microcosm` instances. This exposes the heartbeat used to propagate change.
