# API Cheatsheet

## Microcosm

```
Life Cycle
+--------------+
start - Calls reset(), installs all plugins, and then executes a callback

State Management
+--------------+
push    - Queue up an action, potentially changing data
prepare - Partially apply push
replace - Replace state with the result of deserializing a set of data
reset   - Replace state with the result of calling `getInitialState`
state   - An object reference to current application state

Life Cycle
+--------------+
getInitialState - Reduces the result of calling `getInitialState` on all stores

Serialization
+--------------+
deserialize - Parse external data into an acceptable format
serialize   - Convert internal data into an acceptable external format
toJSON      - Serialize to JSON (calls `serialize` by default)

Events
+--------------+
listen - Add a callback listener. Aliases: subscribe
ignore - Remove a callback listener. Aliases: unsubscribe
emit   - Trigger an event. Aliases: publish

Configure
+--------------+
addPlugin - Append an entry into the list of known plugins
addStore  - Add an entry to the map of known stores
```

## Store

```
Life Cycle
+--------------+
getInitialState - Determines the initial state required to operate. Called on `Microcosm::start`
willReset - Called whenever `Microcosm::reset` or `Microcosm::replace` is executed.

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
