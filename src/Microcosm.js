/**
 * Microcosm
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world.
 */

import Action  from './Action'
import Diode   from 'diode'
import Foliage from 'foliage'
import Plugin  from './Plugin'
import Store   from './Store'
import assert  from './assert'
import install from './install'
import remap   from './remap'
import remapIf from './remapIf'

export default class Microcosm extends Foliage {

  constructor() {
    super()

    Diode.decorate(this)

    this._stores  = {}
    this._plugins = []
  }

  push(signal, ...params) {
    Action.validate(signal)

    const request = signal(...params)

    // Actions some times return promises. When this happens, wait for
    // them to resolve before moving on
    if (request instanceof Promise) {
      return request.then(body => this.dispatch(signal, body))
    }

    return this._root.dispatch(signal, request)
  }

  prepare(fn, ...buffer) {
    Action.validate(fn)
    return this.push.bind(this, fn, ...buffer)
  }

  replace(data) {
    this.commit(this.deserialize(data))
  }

  dispatch(action, body) {
    let actors = remapIf(this._stores, store => action in store)

    for (var key in actors) {
      let actor = this._stores[key]
      actor[action](this.graft(key), body)
    }

    this.emit()

    return body
  }

  addPlugin(plugin, options) {
    Plugin.validate(plugin)

    this._plugins.push([ plugin, options ])
  }

  addStore(key, store) {
    // Don't reassign stores that are already included. Fail hard.
    assert(!this._stores[key], `Tried store with key of "${key}" but it already exists!`)

    // Make sure life cycle methods are included and then
    // add the validated stores to the list of known entities
    this._stores[key] = { ...Store, ...store }
  }

  serialize() {
    return remap(this._stores, (store, key) => store.serialize(this.get(key)))
  }

  deserialize(data={}) {
    return remap(this._stores, (store, key) => store.deserialize(data[key]))
  }

  toJSON() {
    return this.serialize()
  }

  toObject() {
    return remapIf(this._state, () => true)
  }

  start(...next) {
    // Start by producing the initial state
    this.commit(remap(this._stores, store => store.getInitialState()))

    // Queue plugins and then notify that installation has finished
    install(this._plugins, this, function() {
      next.forEach(callback => callback())
    })
  }

}
