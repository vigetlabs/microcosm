import Debug       from './plugins/debug'
import Diode       from 'diode'
import History     from './plugins/history'
import MetaStore   from './stores/meta'
import State       from './plugins/state'
import Transaction from './Transaction'
import defaults    from './defaults'
import flatten     from './flatten'
import install     from './install'
import lifecycle   from './lifecycle'
import merge       from './merge'
import tag         from './tag'

function Microcosm (options) {
  /**
   * Microcosm uses Diode for event emission. Diode is an event emitter
   * with a single event.
   * https://github.com/vigetlabs/diode
   */
  Diode(this)

  this.state   = {}
  this.stores  = []
  this.plugins = []

  // Standard store reduction behaviors
  this.addStore(MetaStore)

  // A place to keep all developer warnings
  this.addPlugin(Debug)

  // Manage key lifecycle hooks for state
  this.addPlugin(State)

  // Keep track of history as a tree
  this.addPlugin(History, options)
}

Microcosm.prototype = {
  constructor: Microcosm,

  getInitialState() {
    return this.lifecycle(lifecycle.willStart)
  },

  rollforward() {
    this.state = this.lifecycle(lifecycle.willRollforward)

    this.emit(this.state)

    return this
  },

  lifecycle(hook, initial={}) {
    return this.plugins.reduce((state, plugin) => {
      return plugin[hook] ? plugin[hook](this, state) : state
    }, initial)
  },

  push(action, params, callback) {
    let transaction = new Transaction(tag(action))

    this.lifecycle(lifecycle.willOpenTransaction, transaction)

    return transaction.execute(params, this.rollforward, callback, this)
  },

  /**
   * Partially applies `push`.
   */
  prepare(action, params=[]) {
    return (more=[], callback) => this.push(action, flatten(params, more), callback)
  },

  /**
   * Pushes a plugin in to the registry for a given microcosm.
   * When `app.start()` is called, it will execute plugins in
   * the order in which they have been added using this function.
   */
  addPlugin(config, options={}) {
    let plugin = merge({ app: this, options }, defaults(config))

    this.plugins.push(
      this.lifecycle(lifecycle.willAddPlugin, plugin)
    )

    return this
  },

  /**
   * Generates a store based on the provided `config` and assigns it to
   * manage the provided `key`. Whenever this store responds to an action,
   * it will be provided the current state for that particular key.
   */
  addStore(keyPath, store) {
    if (arguments.length < 2) {
      // Important! Assignment this way is important
      // to support IE9, which has an odd way of referencing
      // arguments
      store   = keyPath
      keyPath = [];
    }

    this.stores.push([
      flatten(keyPath),
      this.lifecycle(lifecycle.willAddStore, defaults(store))
    ])

    return this
  },

  /**
   * Reset by pushing an action that will always return
   * a given state.
   */
  reset(state, callback) {
    return this.push(lifecycle.willReset,
                     this.lifecycle(lifecycle.willReset, state),
                     callback)
  },

  /**
   * Deserialize a given state and pass it into reset to determine a new state.
   */
  replace(data, callback) {
    return this.reset(this.deserialize(data), callback)
  },

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   */
  serialize() {
    return this.lifecycle(lifecycle.willSerialize, this.state)
  },

  /**
   * For each key in the provided `data` parameter, transform it using
   * the `deserialize` method provided by the store managing that key.
   * Then fold the deserialized data over the current application state.
   */
  deserialize(data) {
    return this.lifecycle(lifecycle.willDeserialize, data)
  },

  /**
   * Alias for `serialize`
   */
  toJSON() {
    return this.serialize()
  },

  /**
   * Starts an application:
   * 1. Run through all plugins, it will terminate if any fail
   * 2. Execute the provided callback, passing along any errors
   *    generated if installing plugins fails.
   */
  start(callback) {
    install(this.plugins, callback)
    return this
  }

}

export default Microcosm
