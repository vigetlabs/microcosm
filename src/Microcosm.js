/**
 * Microcosm
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world.
 */

const Diode   = require('diode')
const Foliage = require('foliage')
const Store   = require('./Store')
const install = require('./install')
const remap   = require('./remap')

module.exports = class Microcosm extends Foliage {

  constructor() {
    super()

    Diode.decorate(this)

    this._stores  = {}
    this._plugins = []
  }

  push(signal, ...params) {
    const request = signal(...params)

    // Actions some times return promises. When this happens, wait for
    // them to resolve before moving on
    if (request instanceof Promise) {
      return request.then(body => this.dispatch(signal, body))
    }

    return this._root.dispatch(signal, request)
  }

  prepare(fn, ...buffer) {
    return this.push.bind(this, fn, ...buffer)
  }

  replace(data) {
    this.commit(this.deserialize(data))
    this.emit()
  }

  dispatch(action, body) {
    let dirty = false

    for (var key in this._stores) {
      let actor = this._stores[key][action]

      if (actor) {
        this.set(key, actor(this.get(key), body))
        dirty = true
      }
    }

    if (dirty) {
      this.emit()
    }

    return body
  }

  addPlugin(plugin, options) {
    this._plugins.push([ plugin, options ])
  }

  addStore(key, store) {
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

  start(...next) {
    // Start by producing the initial state
    this.commit(remap(this._stores, store => store.getInitialState()))

    // Queue plugins and then notify that installation has finished
    install(this._plugins, this, function() {
      next.forEach(callback => callback())
    })

    return this
  }

}
