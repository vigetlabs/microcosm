/**
 * Microcosm
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world.
 */

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

    this.stores  = {}
    this.plugins = []
  }

  getInitialState() {
    return remap(this.stores, store => store.getInitialState())
  }

  reset() {
    this.commit(this.getInitialState())
  }

  replace(data) {
    this.update(this.deserialize(data))
    this.volley()
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

  toObject() {
    return this.valueOf()
  }

  start(/*...callbacks*/) {
    let callbacks = arguments

    this.reset()

    // Queue plugins and then notify that installation has finished
    install(this.plugins, this, () => run(callbacks, [], this, 'start'))

    return this
  }

  push(action, ...params) {
    let signal = new Signal(action, params)
    return signal.pipe(result => this.dispatch(action, result))
  }

  prepare(action, ...buffer) {
    return this.push.bind(this, action, ...buffer)
  }

  dispatch(action, payload) {
    tag(action)

    for (let key in this.stores) {
      let state = this.get(key)
      let store = this.stores[key]

      this.set(key, store.send(state, action, payload))
      this.volley()
    }

    return payload
  }

}

module.exports = Microcosm
