/**
 * Microcosm
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world.
 */

const Diode   = require('diode')
const Foliage = require('foliage')
const Signal  = require('./Signal')
const Store   = require('./Store')
const install = require('./install')
const remap   = require('./remap')
const run     = require('./run')
const tag     = require('./tag')

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
    this.update(this.deserialize(data))
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

  start() {
    this.reset()

    // Queue plugins and then notify that installation has finished
    install(this.plugins, this, () => run(arguments, [], this))

    return this
  }

  push(action, params, ...callbacks) {
    let app = this.getRoot()

    return Signal(action, params, function (error, result) {
      if (!error) {
        app.dispatch(action, result)
      }

      run(callbacks, [ error, result ], app)
    })
  }

  dispatch(action, params) {
    tag(action)

    for (var key in this.stores) {
      let state = this.get(key)
      let next  = this.stores[key].send(state, action, params)

      if (state !== next) {
        this.set(key, next)
        this.volley()
      }
    }

    return params
  }

}

module.exports = Microcosm
