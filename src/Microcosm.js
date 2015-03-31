/**
 * Microcosm
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world.
 */

import Store   from './Store'
import assert  from './assert'
import copyIf  from './copyIf'
import install from './install'
import pulse   from './pulse'
import remap   from './remap'

export default class Microcosm {

  constructor() {
    pulse(this)

    this._state   = {}
    this._stores  = {}
    this._plugins = []
  }

  get(key) {
    return this._state[key]
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

  push(data) {
    this.commit(this.deserialize(data))
  }

  commit(next) {
    this._state = next
    this.emit()
  }

  dispatch(action, body) {
    let changes = copyIf(this._stores, store => action in store)

    if (Object.keys(changes).length > 0) {
      let clone  = this.clone()

      let staged = remap(changes,
                         store => store[action](clone[store], body),
                         clone)

      this.commit(staged)
    }

    return body
  }

  addPlugin(plugin, options) {
    assert('register' in plugin, 'Plugins must have a register method.')
    this._plugins.push([ plugin, options ])
  }

  addStore(store) {
    // Make sure life cycle methods are included
    const safe = { ...Store, ...store }

    // Don't reassign stores that are already included. Fail hard.
    assert(!this._stores[store], `Tried to add "${store}" but it is not unique`)

    // Add the validated stores to the list of known entities
    this._stores[safe] = safe
  }

  serialize() {
    return remap(this._stores, store => store.serialize(this.get(store)))
  }

  deserialize(data={}) {
    return remap(this._stores, store => store.deserialize(data[store]))
  }

  toJSON() {
    return this.serialize()
  }

  toObject() {
    return copyIf(this._state, () => true)
  }

  start(...next) {
    // Start by producing the initial state
    this._state = remap(this._stores, store => store.getInitialState())

    // Queue plugins and then notify that installation has finished
    install(this._plugins, this, function() {
      next.forEach(callback => callback())
    })
  }

}
