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

  /**
   * Generates the initial state a microcosm starts with. The reduction
   * of calling `getInitialState` on all stores.
   * @return Object
   */
  getInitialState() {
    return remap(this.stores, store => store.getInitialState())
  }

  /**
   * Resets state to the result of calling `getInitialState()`
   * @return this
   */
  reset() {
    this.commit(this.getInitialState())
    return this
  }

  /**
   * Executes `deserialize` on the provided data and then merges it into
   * the current application state.
   *
   * This function is great for bootstrapping data when rendering from the
   * server. It will not blow away keys that haven't been provided.
   *
   * @param {Object} data - A JavaScript object of data to replace
   * @return this
   */
  replace(data) {
    this.update(this.deserialize(data))
    this.volley()
    return this
  }

  /**
   * Pushes a plugin in to the registry for a given microcosm.
   * When `app.start()` is called, it will execute plugins in
   * the order in which they have been added using this function.
   *
   * @param {Object} plugin  - The plugin that will be added
   * @param {Object} options - Options passed to the plugin on start
   * @return this
   */
  addPlugin(plugin, options) {
    this.plugins.push([plugin, options])
    return this
  }

  /**
   * Generates a store based on the provided `config` and assigns it to
   * manage the provided `key`. Whenever this store responds to an action,
   * it will be provided the current state for that particular key.
   *
   * @param {String} key - The key in global state the store will manage
   * @param {Object} config - Configuration options to build a new store
   * @return this
   */
  addStore(key, config) {
    this.stores[key] = new Store(config, key)
    return this
  }

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   *
   * @return Object
   */
  serialize() {
    return remap(this.stores, store => store.serialize(this.get(store)))
  }

  /**
   * For each key in the provided `data` parameter, transform it using
   * the `deserialize` method provided by the store managing that key.
   * Then fold the deserialized data over the current application state.
   *
   * @param {Object} data - Data to deserialize
   * @return Object
   */
  deserialize(data) {
    return remap(data, (state, key) => {
      return this.stores[key].deserialize(state)
    })
  }

  /**
   * Alias for `serialize`
   * @return Object
   */
  toJSON() {
    return this.serialize()
  }

  /**
   * Returns a clone of the current application state
   * @return Object
   */
  toObject() {
    return this.valueOf()
  }

  /**
   * Starts an application. It does a couple of things:
   *
   * 1. Calls `this.reset()` to determine initial state
   * 2. Runs through all plugins, it will terminate if any fail
   * 3. Executes the provided list of callbacks, passing along any errors
   *    generated if installing plugins fails.
   *
   * @param {...Function} callbacks - Callbacks to run after plugins install
   * @return Microcosm
   */
  start(/*...callbacks*/) {
    let callbacks = arguments

    this.reset()

    // Queue plugins and then notify that installation has finished
    install(this.plugins, this, () => run(callbacks, [], this, 'start'))

    return this
  }

  /**
   * Resolves an action. If it resolved successfully, it dispatches that
   * the resulting parameters to registered stores for transformation.
   *
   * @param {Function} action - The action to dispatch
   * @param {...any} params - Arguments the action is called with
   * @return action result
   */
  push(action, ...params) {
    let signal = new Signal(action, params)
    return signal.pipe(result => this.dispatch(action, result))
  }

  /**
   * Partially applies `push`.
   *
   * @param {Function} action - The action to bind
   * @param {...any} params - Prefilled arguments
   * @return function
   */
  prepare(action, ...params) {
    return this.push.bind(this, action, ...params)
  }

  /**
   * Sends a message to each known store asking if it can respond to the
   * provided action. If so, takes the returned new state for that store's
   * managed key and assigns it as new state.
   *
   * This will trigger a change event if any of the stores return a new
   * state.
   *
   * Normally, this function is not called directly. `dispatch` is fire and
   * forget. For almost every use case, `app.push` should be instead as it
   * provides a mechanism for error handing and callbacks.
   *
   * @private
   * @param action - An action function. This will used by Store::register
   * @param payload - Data to send to stores associated with the action
   * @return payload
   */
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
