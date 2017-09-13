const toArray = args => Array.prototype.slice.call(args)

export function updateLocation(location) {
  return location
}

export function push() {
  return toArray(arguments)
}

export function replace() {
  return toArray(arguments)
}

export function go() {
  return toArray(arguments)
}

export function goBack() {
  return toArray(arguments)
}

export function goForward() {
  return toArray(arguments)
}

export class RouterEffect {
  setup(repo, { history }) {
    this.history = history

    this.unsubscribe = this.history.listen(repo.prepare(updateLocation))
  }

  teardown() {
    this.unsubscribe()
  }

  push(repo, args) {
    this.history.push(...args)
  }

  replace(repo, args) {
    this.history.replace(...args)
  }

  go(repo, args) {
    this.history.go(...args)
  }

  goBack(repo, args) {
    this.history.goBack(...args)
  }

  goForward(repo, args) {
    this.history.goForward(...args)
  }

  register() {
    return {
      [push]: this.push,
      [replace]: this.replace,
      [go]: this.go,
      [goBack]: this.goBack,
      [goForward]: this.goForward
    }
  }
}

const pipeline = (memo, fn) => fn(memo)

export class Location {
  setup(repo, { history, middleware }) {
    console.assert(history, 'Location must receive a history option.')

    this.history = history
    this.middleware = middleware

    repo.addEffect(RouterEffect, { history })
  }

  getInitialState() {
    return this.updateLocation(null, this.history.location)
  }

  updateLocation(_last, next) {
    return this.middleware.reduce(pipeline, next)
  }

  register() {
    return {
      [updateLocation]: this.updateLocation
    }
  }
}

Location.defaults = {
  middleware: []
}
