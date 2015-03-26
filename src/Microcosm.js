/**
 * Microcosm
 * An isomorphic flux implimentation. The strength of Microcosm
 * is that each application is its own fully encapsulated world
 */

import Heartbeat from './Heartbeat'
import Store     from './Store'
import assert    from './assert'
import assign    from './assign'
import isEqual   from 'is-equal-shallow'
import mapBy     from './mapBy'

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

  has(...stores) {
    return stores.some(a => this._stores.some(b => `${a}` === `${b}`))
  }

  get(key) {
    // How state should be retrieved. This function is useful to
    // override with the particular method of retrieval for the data
    // structure returned from `getInitialState`
    return this._state[key]
  }

  swap(next) {
    // Given a next state, only trigger an event if state actually changed
    if (this.shouldUpdate(this._state, next)) {
      this._state = next
      this.pump()
    }
  }

  merge(obj) {
    // How state should be re-assigned. This function is useful to
    // override with the particular method of assignment for the data
    // structure returned from `getInitialState`
    this.swap(assign(this._state, obj))
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
    let changes = mapBy(answerable, store => store[action](this.get(store), body))

    // Produce the next state by mapBying changes into the current state
    this.merge(changes)

    // Send back the body to the original signaler
    return body
  }

  addStore(...stores) {
    // Make sure that the Store implements important life cycle methods
    let safe = stores.map(s => assign(Store, s))

    // Don't reassign stores that are already included fail hard
    assert(!this.has(safe), `A toString method within "${stores}" is not unique`)

    // Add the validated stores to the list of known entities
    this._stores = this._stores.concat(safe)

    // Once verified, setup initial state.
    // This is done last so that any callbacks that need to reduce
    // over the current state have the latest list of stores
    this.merge(mapBy(safe, store => store.getInitialState()))
  }

  serialize() {
    return mapBy(this._stores, store => store.serialize(this.get(store)))
  }

  deserialize(data) {
    return mapBy(this._stores, store => store.deserialize(data[store]))
  }

  toJSON() {
    return this.serialize()
  }

}
