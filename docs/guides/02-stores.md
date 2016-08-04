# Domains

Domains in Microcosm do not hold their own data. Instead they transform data from one state to the next.

This guide will go into the specifics of this process, starting with the beginning of the Microcosm lifecycle.


## Getting initial state

A Microcosm asks each of its domains for the initial value of their
associated key when `addDomain()` is invoked. This value is determined by
`getInitialState`:

```javascript
const Planets = {
  getInitialState() {
    return [ 'Mercury', 'Venus', 'Earth', 'Mars' ]
  }
}

repo.addDomain('planets', Planet)
```

Returning an array sets up future expectations. This prevents the need to conduct type checks and another annoying conditional logic before making updates.

## Responding to actions

`register` is called whenever an action is dispatched. It returns an object associating actions with handlers.

```javascript
function addPlanet(data) {
  return data
}

const Planets = {
  getInitialState() {
    return []
  },
  register() {
    return {
      [addPlanet]: this.addPlanet
    }
  },
  addPlanet(planets, params) {
    return planets.concat(params)
  }
}

repo.push(addPlanet, { name: 'earth' }) // this will add Earth
```

Microcosm assigns a unique `toString()` method to each action. When using the ES6 computed key syntax, the result is a function that translates actions into handlers.

If a domain can not respond to an action, it returns the original state. No modification occurs.

## More on handlers

Domain methods designated as handlers have an expected signature:

```javascript
const Domain = {
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

const Users = {
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

Both `Array.prototype.reduce` and `Users.addOne` follow the pattern of `(currentValue, nextItem)`. This is allows domain handlers to be composed in interesting ways.

## Exporting data

Domains have the opportunity to transform data before it is serialized into JSON. This occurs when either `serialize` or `toJSON` are invoked, or when `JSON.stringify` is called upon a Microcosm.

For example, if using
[ImmutableJS](https://github.com/facebook/immutable-js), this might
look like:

```javascript
const Planets = {
  getInitialState() {
    return Immutable.List()
  },
  serialize(planets) {
    return planets.toJSON()
  }
}
```

## Importing data

Data can be injected into a Microcosm using `repo.replace`. When this occurs, `deserialize` will be called on all Domains to allow data to be processed before it enters the repo:

```javascript
const Planets = {
  getInitialState() {
    return Immutable.List()
  },
  deserialize(raw) {
    return Immutable.List(raw)
  }
}
```

## A final word on domains

The surface area for domains is small; this is intentional. They lean on JavaScript language features to do the heavy lifting, making them easy to use out of the context of Microcosm.

Should you elect extract logic from a domain into a separate module, the process should be as painless as possible.

## Wrapping up

This brings us to the end of our discussion about Domains. There is very little else that can be said about them.

In the next guide we will go over the details of Actions. How they can be defined and how they inform Domains to operate on data.

[Guide 3: Actions](./03-actions.md)
