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

class Microcosm extends Foliage {

  constructor() {
    super()

    Diode.decorate(this)

    this.stores  = {}
    this.plugins = []
  }

  getInitialState() {
    return remap(this.stores, store => store.getInitialState())
  }

  reset() {
    this.commit(this.getInitialState())
    this.emit()
  }

  replace(data) {
    let clean = this.deserialize(data)

    for (let key in clean) {
      this.set(key, clean[key])
    }

    this.emit()
  }

  addPlugin(plugin, options) {
    this.plugins.push([ plugin, options ])
  }

  addStore(key, config) {
    this.stores[key] = new Store(config, key)
  }

  serialize() {
    return remap(this.stores, store => store.serialize(this.get(store)))
  }

  deserialize(data={}) {
    return remap(data, (state, key) => {
      return this.stores[key].deserialize(state)
    })
  }

  toJSON() {
    return this.serialize()
  }

  start(...next) {
    this.reset()

    // Queue plugins and then notify that installation has finished
    install(this.plugins, this, function() {
      next.forEach(callback => callback())
    })

    return this
  }

  prepare(action, ...buffer) {
    return this.push.bind(this, action, ...buffer)
  }

  push(action, params, ...next) {
    let app = this.getRoot()

    action(params, function(error, result) {
      if (!error) {
        app.dispatch(action, result)
      }

      next.forEach(fn => fn(error, result))
    })
  }

  dispatch(action, params) {
    for (var key in this.stores) {
      let state = this.get(key)
      let next  = this.stores[key].transform(state, action, params)

      if (state !== next) {
        this.set(key, next)
        this.volley()
      }
    }
  }

}

module.exports = Microcosm
module.exports.tag = require('./tag')
