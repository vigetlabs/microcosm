/**
 * Microcosm
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world
 */

import Store   from './Store'
import assert  from './assert'
import assign  from './assign'
import isEqual from './shallowEquals'
import mapBy   from './mapBy'
import pulse   from './pulse'

export default class Microcosm {

  constructor(options) {
    pulse(this)

    this._state  = this.getInitialState(options)
    this._stores = []
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
    return isEqual(prev, next) === false
  }

  has(key) {
    // Does this instance of microcosm contain the given store?
    // Important: Uses the unique identifier, not the object reference
    return this._stores.some(store => `${key}` === `${store}`)
  }

  get(key) {
    // How state should be retrieved. This function is useful to
    // override with the particular method of retrieval for the data
    // structure returned from `getInitialState`
    return this._state[key]
  }

  swap(next) {
    // Swap is basically a reset where the next state is the result of
    // folding one object over the next
    this.reset(assign(this._state, next))
  }

  reset(next) {
    // Given a next state, only trigger an event if state actually changed
    if (this.shouldUpdate(this._state, next)) {
      this._state = next
      this.pump()
    }
  }

  prepare(fn, ...buffer) {
    return this.send.bind(this, fn, ...buffer)
  }

  send(fn, ...params) {
    const request = fn.apply(this, params)

    // Actions some times return promises. When this happens, wait for
    // them to resolve before moving on
    if (request instanceof Promise) {
      return request.then(body => this.dispatch(fn, body))
    }

    return this.dispatch(fn, request)
  }

  clone() {
    return Object.create(this._state)
  }

  dispatch(action, body) {
    let clone = this.clone()

    // First get all stores that can repond to this action
    const answerable = this._stores.filter(store => action in store)

    // Next build the change set
    let next = mapBy(answerable,
                     store => store[action](clone[store], body),
                     clone)

    // Produce the next state by merging changes into the current state
    this.reset(next)

    // Send back the body to the original signaler
    return body
  }

  addStore(store) {
    // Make sure life cycle methods are included
    const safe = assign(Store, store)

    // Don't reassign stores that are already included. Fail hard.
    assert(!this.has(safe), `Tried to add "${store}" but it is not unique`)

    // Add the validated stores to the list of known entities
    this._stores.push(safe)

    // Once verified, setup initial state. This is done last so that
    // any callbacks that need to reduce over the current state have
    // the latest list of stores
    this.swap({ [safe] : safe.getInitialState() })
  }

  serialize() {
    return mapBy(this._stores, store => store.serialize(this.get(store)))
  }

  deserialize(data={}) {
    return mapBy(this._stores, store => store.deserialize(data[store]))
  }

  seed(data) {
    // Tells the microcosm how it should handle data injected from
    // sources.
    //
    // By default, it will clean the data with `deserialize` and
    // then reset the existing data set with the new values
    this.reset(this.deserialize(data))
  }

  toJSON() {
    return this.serialize()
  }

}
