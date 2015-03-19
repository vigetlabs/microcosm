# Changelog

### 0.2.0

- Remove `get all()` from `Store`. This is to reduce namespace collisions. Stores should define their own getters.

### 0.1.0

- Added a `pump` method to `Microcosm` instances. This exposes the heartbeat used to propagate change.
