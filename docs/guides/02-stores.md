# Stores

Stores in Microcosm do not hold their own data. Instead they transform data from one state to the next.

This guide will go into the specifics of this process, starting with the beginning of the Microcosm lifecycle.


## Getting initial state

A Microcosm asks each of its stores for the initial value of their associated key when it calls `start()`. This is determined by `getInitialState`:

```javascript
var Planets = {
  getInitialState() {
    return [ 'Mercury', 'Venus', 'Earth', 'Mars' ]
  }
}

app.addStore('planets', Planet)

app.start()
```

Returning an array sets up future expectations. This prevents the need to conduct type checks and another annoying conditional logic before making updates.

## Responding to actions

`register` is called whenever an action is dispatched. It returns an object associating actions with handlers.

```javascript
function addPlanet(data) {
	return data
}

var Planets = {
  getInitialState() {
    return []
  },
  register() {
    return {
      [add]: this.add
    }
  },
  add(planets, params) {
    return planets.concat(params)
  }
}

app.push(addPlanet, { name: 'earth' }) // this will add Earth
```

Microcosm assigns a unique `toString()` method to each action. When using the ES6 computed key syntax, the result is a function that translates actions into handlers.

If a store can not respond to an action, it returns the original state. No modification occurs.

## More on handlers

Store methods designated as handlers have an expected signature:

```javascript
let Store = {
  handler(oldState, parameters) {
    return newState
  }
}
```

Leading with old state, they use parameters to return a new state. This format has particular cohesion with `Array.prototype.reduce`:

```javascript
function getUsers() {
  // insert any ajax library here
  return ajax('/users')
}

let Users = {
  getInitialState() {
    return []
  },
  register() {
    return {
      [getUsers]: Users.addMany
    }
  },
  addOne(users, record) {
    return users.concat(record)
  },
  addMany(users, records) {
    return records.reduce(Users.addOne, users)
  }
}
```

Both `Array.prototype.reduce` and `Users.addOne` follow the pattern of `(currentValue, nextItem)`. This is allows store handlers to be composed in interesting ways.

## Exporting data

Stores have the opportunity to transform data before it is serialized into JSON. This occurs when either `serialize` or `toJSON` are invoked, or when `JSON.stringify` is called upon a Microcosm.

For example, if using
[ImmutableJS](https://github.com/facebook/immutable-js), this might
look like:

```javascript
var Planets = {
  getInitialState() {
    return Immutable.List()
  },
  serialize(planets) {
    return planets.toJSON()
  }
}
```

## Importing data

Data can be injected into a Microcosm using `app.replace`. When this occurs, `deserialize` will be called on all Stores to allow data to be processed before it enters the application:

```javascript
var Planets = {
  getInitialState() {
    return Immutable.List()
  },
  deserialize(raw) {
    return Immutable.List(raw)
  }
}
```

## A final word on stores

The surface area for stores is small; this is intentional. They lean on JavaScript language features to do the heavy lifting, making them easy to use out of the context of Microcosm.

Should you elect extract logic from a store into a separate module, the process should be as painless as possible.

## Wrapping up

This brings us to the end of our discussion about Stores. There is very little else that can be said about them.

In the next guide we will go over the details of Actions. How they can be defined and how they inform Stores to operate on data.

[Guide 3: Actions](./03-actions.md)
