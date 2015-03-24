/**
 * Microcosm
 * An isomorphic flux implimentation. The strength of Microcosm
 * is that each application is its own fully encapsulated world
 */

import Heartbeat from 'Heartbeat'
import isEqual   from 'is-equal-shallow'

export default class Microcosm extends Heartbeat {

  constructor() {
    super()

    this._stores = []
    this._state  = this.getInitialState()
  }

  getInitialState() {
    return {}
  }

  shouldUpdate(prev, next) {
    return isEqual(prev, next) == false
  }

  seed(data) {
    let clean = this.deserialize(data)

    Object.keys(clean).forEach(function(key) {
      return this.set(key, clean[key])
    }, this)
  }

  set(key, value) {
    this._state = { ...this._state, [key]: value }
  }

  has(store) {
    return this._stores.indexOf(store) > -1
  }

  get(store, seed) {
    return this._state[store]
  }

  send(fn, ...params) {
    // Allow currying of send method for cleaner callbacks
    if (params.length < fn.length) {
      return this.send.bind(this, fn)
    }

    let request = fn(...params)

    // Actions some times return promises. When this happens, wait for
    // them to resolve before moving on
    if (request instanceof Promise) {
      return request.then(body => this.dispatch(fn, body))
    }

    return this.dispatch(fn, request)
  }

  dispatch(action, body) {
    // First get all stores that can repond to this action
    let answerable = this._stores.filter(store => action in store)

    // Next build the change set
    let changes = answerable.reduce((state, store) => {
      state[store] = store[action](this.get(store), body)
      return state
    }, {})

    // Produce the next state by folding changes into the current state
    let next = { ...this._state, ...changes }

    // Finally, only trigger an event if state actually changed
    if (this.shouldUpdate(this._state, next)) {
      this._state = next
      this.pump()
    }

    // Send back the body to the original signaler
    return body
  }

  addStore(...stores) {
    // Stores can provide a `getInitialState` method which dictates
    // the expected initial state when the Store is added
    var initializers = stores.filter(store => 'getInitialState' in store)

    initializers.forEach(store => this.set(store, store.getInitialState()))

    this._stores = this._stores.concat(stores)
  }

  serialize() {
    // Stores can provide a `serialize` method which shapes how
    // state is converted to JSON
    let serializers = this._stores.filter(store => 'serialize' in store)

    return serializers.reduce((memo, store) => {
      memo[store] = store.serialize(this.get(store))
      return memo
    }, { ...this._state })
  }

  deserialize(data) {
    let safe = this._stores.filter(store => store in data)
                           .filter(store => 'deserialize' in store)

    return safe.reduce(function(memo, store) {
      memo[store] = store.deserialize(data[store])
      return memo
    }, { ...data })
  }

  toJSON() {
    return this.serialize()
  }
}
