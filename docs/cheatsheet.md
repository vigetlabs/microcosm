# API Cheatsheet

## Microcosm

```
Life Cycle
+--------------+
start - Resets initial state, installs all plugins, and then executes a callback

Data Operations
+--------------+
clone  - Return a new object whose prototype is the last state
commit - Assign a new state, trigger an event
pull   - Provided a key, return that entry in the state object
push   - Replace state with the result of deserializing a set of data

Serialization
+--------------+
deserialize - Parse external data into an acceptable format
serialize   - Convert internal data into an acceptable external format
toJSON      - Serialize to JSON (calls `serialize` by default)
toObject    - Return a flat copy of the latest revision of state

Message passing
+--------------+
dispatch - Send an action and payload to all stores
prepare  - Partially apply the `send` method
send     - Given a set of parameters, execute an action and forward that result to `dispatch`

Events
+--------------+
listen - Add a callback listener
ignore - Remove a callback listener
emit   - Trigger an event

Install
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
