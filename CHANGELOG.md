# Changelog

### 1.0.0

- Actions must now be tagged with `microcosm/tag`. See README for usage.
- Stores no longer inherit from `Store` base class. See README for usage.
- Microcosms no longer require `addActions`
- Stores must now be accessed with: `microcosm.get(Store)`
- Actions are now fired with `send`: `microcosm.send(Action, params)`
- Many more internal changes. See readme for an updated guide.

### 0.2.0

- Remove `get all()` from `Store`. This is to reduce namespace collisions. Stores should define their own getters.

### 0.1.0

- Added a `pump` method to `Microcosm` instances. This exposes the heartbeat used to propagate change.
