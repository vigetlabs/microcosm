# Global





* * *

## Class: Microcosm
Microcosm

### Microcosm.getInitialState() 

Dispatch the `getInitialState` action type to stores to determine
new state. Stores receive the old state as the payload.

**Returns**: `object`, The initial state of the Microcosm instance.

### Microcosm.push(action, params, callback) 

Resolves an action. Sends the result and any errors to a given
error-first callback.

**Parameters**

**action**: `function`, The action that will be resolved.

**params**: `any | Array`, A list or single value to call the action with.

**callback**: `function`, An error-first callback to execute when the action resolves

**Returns**: `any`, The result of the action

### Microcosm.prepare(action, params) 

Partially applies `push`.

**Parameters**

**action**: `function`, The action to eventually push

**params**: `any | Array`, A list or single value to prepopulate the params argument of push()

**Returns**: `function`

### Microcosm.addPlugin(plugin, options) 

Pushes a plugin in to the registry for a given microcosm.
When `app.start()` is called, it will execute plugins in
the order in which they have been added using this function.

**Parameters**

**plugin**: `object | function`, A plugin object or register function

**options**: `object`, Passed into the register function when the app starts.

**Returns**: `Microcosm`, The invoking instance of Microcosm

### Microcosm.addStore(key, store) 

Generates a store based on the provided `config` and assigns it to
manage the provided `key`. Whenever this store responds to an action,
it will be provided the current state for that particular key.

**Parameters**

**key**: `string`, The key in which the store will write to application state

**store**: `object`, A Microcosm store object

**Returns**: `Microcosm`, The invoking instance of Microcosm

### Microcosm.reset(state, callback) 

Reset by pushing an action that will always return
a given state.

**Parameters**

**state**: `object`, The new state to reset the application with

**callback**: `function`, A callback to execute after the application resets

**Returns**: `object`, The new state object

### Microcosm.replace(data, callback) 

Deserialize a given state and pass it into reset to determine a new state.

**Parameters**

**data**: `object`, State to deserialize and reset the application with

**callback**: `function`, A callback to execute after the application resets

**Returns**: `object`, The new state object

### Microcosm.serialize() 

Returns an object that is the result of transforming application state
according to the `serialize` method described by each store.

**Returns**: `object`, Serialized state

### Microcosm.deserialize(data) 

For each key in the provided `data` parameter, transform it using
the `deserialize` method provided by the store managing that key.
Then fold the deserialized data over the current application state.

**Parameters**

**data**: `object`, Data to deserialize

**Returns**: `object`, Deserialized state

### Microcosm.toJSON() 

Alias for `serialize`


### Microcosm.start(callback) 

Starts an application:
1. Run through all plugins, it will terminate if any fail
2. Execute the provided callback, passing along any errors
   generated if installing plugins fails.

**Parameters**

**callback**: `function`, A callback to execute after the application starts

**Returns**: `Microcosm`, The invoking instance of Microcosm



* * *










