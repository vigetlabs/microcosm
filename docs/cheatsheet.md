# API Cheatsheet

## Microcosm

```
State Management
+--------------+
push    - Queue up an action, potentially changing data
replace - Replace state with the result of deserializing a set of data
reset   - Replace state with the result of calling `getInitialState`
state   - An object reference to current application state

Lifecycle
+--------------+
getInitialState - Reduces the result of calling `getInitialState` on all stores

Serialization
+--------------+
deserialize - Parse external data into an acceptable format
toJSON      - Convert internal data into JSON

Events
+--------------+
on  - Add a callback listener. Aliases: addEventListener
off - Remove a callback listener. Aliases: removeEventListener

Configure
+--------------+
addStore - Add an entry to the map of known stores
```

## Store

```
Life Cycle
+--------------+
getInitialState - Determines the initial state required to operate. Called on `Microcosm::start`
willReset - Called whenever `Microcosm::reset` or `Microcosm::replace` is executed.
register - Indicate what actions a Store should respond to
receive - A lower level version of register that accepts the prior state and dispatched action

Serialization
+--------------+
deserialize - Returns a cleaned object given external data for the managed key
serialize   - Returns a serialized object for the managed key
```
