/**
 * Microcosm
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world.
 */

const Diode   = require('diode')
const Signal  = require('./Signal')
const Store   = require('./Store')
const install = require('./install')
const remap   = require('./remap')
const run     = require('./run')
const tag     = require('./tag')

function Microcosm() {
  Diode.decorate(this)

  this.state   = {}
  this.stores  = {}
  this.plugins = []
}

Microcosm.prototype = {

  getInitialState() {
    return remap(this.stores, store => store.getInitialState())
  },

  commit(state) {
    this.state = state
    this.volley()
  },

  get(key) {
    return this.state[key]
  },

  set(key, value) {
    let current = this.get(key)

    if (current !== value) {
      this.state[key] = value
      this.volley()
    }
  },

  reset() {
    this.commit(this.getInitialState())
  },

  replace(data) {
    let cleaned = this.deserialize(data)

    for (let key in cleaned) {
      this.set(key, cleaned[key])
    }
  },

  addPlugin(plugin, options) {
    this.plugins.push([ plugin, options ])
  },

  addStore(key, config) {
    this.stores[key] = new Store(config, key)
  },

  serialize() {
    return remap(this.stores, store => store.serialize(this.get(store)))
  },

  deserialize(data={}) {
    return remap(data, (state, key) => {
      return this.stores[key].deserialize(state)
    })
  },

  toJSON() {
    return this.serialize()
  },

  valueOf() {
    return this.state
  },

  toObject() {
    return this.valueOf()
  },

  start() {
    this.reset()

    // Queue plugins and then notify that installation has finished
    install(this.plugins, this, () => run(arguments, [], this))

    return this
  },

  push(action, params, ...callbacks) {
    return Signal(action, params, (error, result) => {
      if (!error) {
        this.dispatch(action, result)
      }

      run(callbacks, [ error, result ], this)
    })
  },

  dispatch(action, params) {
    tag(action)

    for (let key in this.stores) {
      let state = this.get(key)
      let store = this.stores[key]

      this.set(key, store.send(state, action, params))
    }

    return params
  }

}

module.exports = Microcosm
