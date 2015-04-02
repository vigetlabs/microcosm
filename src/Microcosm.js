/**
 * Microcosm
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world.
 */

import Action  from './Action'
import Plugin  from './Plugin'
import Store   from './Store'
import assert  from './assert'
import clone   from './clone'
import install from './install'
import pulse   from './pulse'
import remap   from './remap'
import remapIf from './remapIf'

export default class Microcosm {

  constructor() {
    pulse(this)

    this._state   = {}
    this._stores  = {}
    this._plugins = []
  }

  push(signal, ...params) {
    Action.validate(signal)

    const request = signal(...params)

    // Actions some times return promises. When this happens, wait for
    // them to resolve before moving on
    if (request instanceof Promise) {
      return request.then(body => this._dispatch(signal, body))
    }

    return this._dispatch(signal, request)
  }

  pull(key, fn, ...args) {
    let val = this._state[key]
    return typeof fn === 'function' ? fn.call(this, val, ...args) : val
  }

  prepare(fn, ...buffer) {
    Action.validate(fn)
    return this.push.bind(this, fn, ...buffer)
  }

  replace(data) {
    this._commit(this.deserialize(data))
  }

  _commit(next) {
    this._state = next
    this.emit()
  }

  _dispatch(action, body) {
    let actors = remapIf(this._stores, store => action in store)

    if (Object.keys(actors).length > 0) {
      let copy   = clone(this._state)
      let staged = remap(actors, store => store[action](copy[store], body), copy)

      this._commit(staged)
    }

    return body
  }

  addPlugin(plugin, options) {
    Plugin.validate(plugin)

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
    return remap(this._stores, store => store.serialize(this.pull(store)))
  }

  deserialize(data={}) {
    return remap(this._stores, store => store.deserialize(data[store]))
  }

  toJSON() {
    return this.serialize()
  }

  toObject() {
    return remapIf(this._state, () => true)
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
