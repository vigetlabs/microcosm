# API Cheatsheet

## Microcosm

```
Life Cycle
+--------------+
start - Resets initial state, installs all plugins, and then executes a callback

State Management
+--------------+
pull    - Provided a key, return that entry in the state object
push    - Queue up an action, potentially changing data
prepare - Partially apply the `push` method
replace - Replace state with the result of deserializing a set of data

Serialization
+--------------+
deserialize - Parse external data into an acceptable format
serialize   - Convert internal data into an acceptable external format
toJSON      - Serialize to JSON (calls `serialize` by default)
toObject    - Return a flat copy of the latest revision of state

Events
+--------------+
listen - Add a callback listener
ignore - Remove a callback listener
emit   - Trigger an event

Configure
+--------------+
addPlugin - Append an entry into the list of known plugins
addStore  - Add an entry to the map of known stores
```

## Store

```
Identity
+--------------+
toString - Must return a unique string identifying which key this store manages in global state

Life Cycle
+--------------+
getInitialState - Determines the initial state required to operate. Called on `Microcosm::start`

Serialization
+--------------+
deserialize - Returns a cleaned object given external data for the managed key
serialize   - Returns a serialized object for the managed key
```

## Plugin

```
Life Cycle
+--------------+
register - setup behavior to execute for a plugin when `Microcosm::start` is executed
```
