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

  has(...stores) {
    return stores.some(a => this._stores.some(b => `${a}` === `${b}`))
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

  prepare(fn, ...buffer) {
    return this.send.bind(this, fn, ...buffer)
  }

  send(fn, ...params) {
    let request = fn.apply(this, params)

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
    // Make sure that the Store implements important life cycle methods
    let safe = stores.map(store => {
      return { ...Store, ...store }
    })

    // Don't reassign stores that are already included
    // fail hard
    if (this.has(safe)) {
      throw Error(`A toString method within "${stores.join(', ')}" is not unique`)
    }

    // Once verified, setup initial state
    safe.forEach(store => this.set(store, store.getInitialState()))

    this._stores = this._stores.concat(safe)
  }

  serialize() {
    return this._stores.reduce((memo, store) => {
      memo[store] = store.serialize(this.get(store))
      return memo
    }, {})
  }

  deserialize(data) {
    return this._stores.reduce(function(memo, store) {
      memo[store] = store.deserialize(data[store])
      return memo
    }, {})
  }

  toJSON() {
    return this.serialize()
  }

}
