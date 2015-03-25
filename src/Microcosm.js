/**
 * Microcosm
 * An isomorphic flux implimentation. The strength of Microcosm
 * is that each application is its own fully encapsulated world
 */

import Heartbeat from './Heartbeat'
import Store     from './Store'
import isEqual   from 'is-equal-shallow'

export default class Microcosm extends Heartbeat {

  constructor() {
    super()

    this._stores = []
    this._state  = this.getInitialState()
  }

  getInitialState() {
    // Assigns the default state. Most of the time this will not need
    // to be overridden, however if using something like ImmutableJS,
    // you could return a different data structure here.
    return {}
  }

  shouldUpdate(prev, next) {
    // Whenever an action is dispatched, the resulting state
    // modification will be diffed to identify if a change event
    // should fire.
    //
    // The default strategy for determining that state has changed
    // is a simple shallow equals check
    return isEqual(prev, next) == false
  }

  seed(data) {
    // Tells the microcosm how it should handle data injected from
    // sources.
    //
    // By default, it will clean the data with `deserialize` and
    // then override the existing data set with the new values
    this.swap(this.deserialize(data))
  }

  swap(next) {
    // Given a next state, only trigger an event if state actually changed
    if (this.shouldUpdate(this._state, next)) {
      this._state = next
      this.pump()
    }
  }

  set(key, value) {
    // How state should be re-assigned. This function is useful to
    // override with the particular method of assignment for the data
    // structure returned from `getInitialState`
    this._state = { ...this._state, [key]: value }
  }

  get(key) {
    // How state should be retrieved. This function is useful to
    // override with the particular method of retrieval for the data
    // structure returned from `getInitialState`
    return this._state[key]
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
    this.swap({ ...this._state, ...changes })

    // Send back the body to the original signaler
    return body
  }

  addStore(...stores) {
    this._stores = stores.reduce((pool, store) => {
      // Make sure that the Store implements important life cycle
      // methods
      let valid = { ...Store, ...store }

      // Once verified, setup initial state
      this.set(valid, valid.getInitialState())

      // Finally, add it to the pool of known stores
      return pool.concat(valid)
    }, this._stores)
  }

  serialize() {
    return this._stores.reduce((memo, store) => {
      memo[store] = store.serialize(this.get(store))
      return memo
    }, { ...this._state })
  }

  deserialize(data) {
    return this._stores.reduce(function(memo, store) {
      memo[store] = store.deserialize(data[store])
      return memo
    }, { ...data })
  }

  toJSON() {
    return this.serialize()
  }

}
