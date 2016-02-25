import Debug       from './plugins/debug'
import Diode       from 'diode'
import History     from './plugins/history'
import MetaStore   from './stores/meta'
import State       from './plugins/state'
import Transaction from './Transaction'
import compile     from './compile'
import defaults    from './defaults'
import dispatch    from './dispatch'
import flatten     from './flatten'
import install     from './install'
import lifecycle   from './lifecycle'
import merge       from './merge'
import tag         from './tag'

function throwIfError (error) {
  if (error) {
    throw error
  }
}

/**
 * Microcosm
 * @class
 */
function Microcosm (options) {
  /**
   * Microcosm uses Diode for event emission. Diode is an event emitter
   * with a single event.
   * https://github.com/vigetlabs/diode
   */
  Diode(this)

  this.state    = {}
  this.stores   = []
  this.plugins  = []
  this.registry = {}

  // Standard store reduction behaviors
  this.addStore(MetaStore)

  // A place to keep all developer warnings
  this.addPlugin(Debug)

  // Keep track of history as a tree
  this.addPlugin(History, options)

  // Manage key lifecycle hooks for state
  this.addPlugin(State)
}

Microcosm.prototype = {
  constructor: Microcosm,
  started: false,

  /**
   * Calculates initial state. This is no longer used internally,
   * however is useful when testing and for backwards compatibility.
   *
   * @return {object} The initial state of the Microcosm instance.
   */
  getInitialState() {
    return this.lifecycle(lifecycle.willStart)
  },

  /**
   * Determines the next application state by reducing the result of
   * the `willUpdate` lifecycle hook.
   *
   * @private
   * @return {Microcosm}
   */
  rollforward() {
    this.state = this.lifecycle(lifecycle.willUpdate)

    this.emit(this.state)

    return this
  },

  /**
   * For each plugin that implements a specific lifecycle method,
   * reduce a given state over those methods sequentially and return
   * the result.
   *
   * @param hook {function} The lifecycle method to reduce
   * @param {any} [initial={}] The initial state before reducing
   *
   * @private
   */
  lifecycle(hook, initial={}) {
    return this.plugins.reduce((state, plugin) => {
      return plugin[hook] ? plugin[hook](this, state) : state
    }, initial)
  },

  /**
   * Given an old state, an action type, and a payload, reduce through
   * the registry (or compile it) for the given action type to determine
   * new state.
   *
   * @param state {object} The starting application state
   * @param type {string} The action type to reduce
   * @param payload {any} The data to send to stores
   *
   * @private
   */
  dispatch(state, type, payload) {
    if (!this.registry[type]) {
      this.registry[type] = compile(this.stores, type)
    }

    return dispatch(state, this.registry[type], payload)
  },

  /**
   * Resolves an action. Sends the result and any errors to a given
   * error-first callback.
   *
   * @param {function} action - The action that will be resolved.
   * @param {any|Array} [params] - A list or single value to call the action with.
   * @param {function} [callback] - An error-first callback to execute when the action resolves
   *
   * @return {any} The result of the action
   */
  push(action, params, callback) {
    if (!this.started) throw new Error('Cannot push: Did you forget to call app.start()?')

    let transaction = new Transaction(tag(action))

    this.lifecycle(lifecycle.willOpenTransaction, transaction)

    return transaction.execute(params, this.rollforward, callback, this)
  },

  /**
   * Partially applies `push`.
   *
   * @param {function} action - The action to eventually push
   * @param {any|Array} [params] - A list or single value to prepopulate the params argument of push()
   *
   * @return {Function}
   */
  prepare(action, params=[]) {
    return (more=[], callback) => this.push(action, flatten(params, more), callback)
  },

  /**
   * Pushes a plugin in to the registry for a given microcosm.
   * When `app.start()` is called, it will execute plugins in
   * the order in which they have been added using this function.
   *
   * @param {object|Function} plugin - A plugin object or register function
   * @param {object} [options] - Passed into the register function when the app starts.
   *
   * @return {Microcosm} The invoking instance of Microcosm
   */
  addPlugin(plugin, options={}) {
    let prepared = merge({ app: this, options }, defaults(plugin))

    this.plugins.push(
      this.lifecycle(lifecycle.willAddPlugin, prepared)
    )

    return this
  },

  /**
   * Generates a store based on the provided `config` and assigns it to
   * manage the provided `key`. Whenever this store responds to an action,
   * it will be provided the current state for that particular key.
   *
   * @param {string} [key] - The key in which the store will write to application state
   * @param {object} store - A Microcosm store object
   *
   * @return {Microcosm} The invoking instance of Microcosm
   */
  addStore(keyPath, store) {
    if (arguments.length < 2) {
      // Important! Assignment this way is important
      // to support IE9, which has an odd way of referencing
      // arguments
      store   = keyPath
      keyPath = []
    }

    // Reset the registry to account for the new store
    this.registry = {}

    this.stores.push([
      flatten(keyPath),
      this.lifecycle(lifecycle.willAddStore, defaults(store))
    ])

    return this
  },

  /**
   * Reset by pushing an action that will always return
   * a given state.
   *
   * @param {object} state - The new state to reset the application with
   * @param {function} [callback] - A callback to execute after the application resets
   *
   * @return {object} The new state object
   */
  reset(state, callback) {
    return this.push(lifecycle.willReset,
                     this.lifecycle(lifecycle.willReset, state),
                     callback)
  },

  /**
   * Deserialize a given state and pass it into reset to determine a new state.
   *
   * @param {object} data - State to deserialize and reset the application with
   * @param {function} [callback] - A callback to execute after the application resets
   *
   * @return {object} The new state object
   */
  replace(data, callback) {
    return this.reset(this.deserialize(data), callback)
  },

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   *
   * @return {object} Serialized state
   */
  serialize() {
    return this.lifecycle(lifecycle.willSerialize, this.state)
  },

  /**
   * For each key in the provided `data` parameter, transform it using
   * the `deserialize` method provided by the store managing that key.
   * Then fold the deserialized data over the current application state.
   *
   * @param {object} data - Data to deserialize
   * @return {object} Deserialized state
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
   *
   * @param {function} [callback] - A callback to execute after the application starts
   * @return {Microcosm} The invoking instance of Microcosm
   */
  start(callback=throwIfError) {
    this.started = true
    install(this.plugins, callback)
    return this
  }

}

export default Microcosm
