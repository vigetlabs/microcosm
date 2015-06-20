let Foliage = require('foliage')
let Plugin  = require('./Plugin')
let React   = require('react')
let Store   = require('./Store')
let install = require('./install')
let remap   = require('./remap')
let run     = require('./run')
let signal  = require('./signal')
let tag     = require('./tag')

let Microcosm = function() {
  Foliage.apply(this, arguments)

  this.stores  = {}
  this.plugins = []
}

Microcosm.prototype = Object.assign({}, Foliage.prototype, {

  constructor: Microcosm,

  /**
   * Generates the initial state a microcosm starts with. The reduction
   * of calling `getInitialState` on all stores.
   * @return Object
   */
  getInitialState() {
    return remap(this.stores, store => store.getInitialState())
  },

  /**
   * Resets state to the result of calling `getInitialState()`
   * @return this
   */
  reset() {
    this.commit(this.getInitialState())
    return this
  },

  /**
   * Executes `deserialize` on the provided data and then merges it into
   * the current application state. This function is great for
   * bootstrapping data when rendering from the server. It will not
   * blow away keys that haven't been provided.
   *
   * @param {Object} data - A JavaScript object of data to replace
   * @return this
   */
  replace(data) {
    this.update(this.deserialize(data))
    return this
  },

  /**
   * Pushes a plugin in to the registry for a given microcosm.
   * When `app.start()` is called, it will execute plugins in
   * the order in which they have been added using this function.
   *
   * @param {Object} plugin  - The plugin that will be added
   * @param {Object} options - Options passed to the plugin on start
   * @return this
   */
  addPlugin(config, options) {
    this.plugins.push(new Plugin(config, options))
    return this
  },

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
    if (process.env.NODE_ENV !== 'production' && arguments.length <= 1) {
      throw TypeError(`Microcosm::addStore expected string key but was given: ${ typeof key }. Did you forget to include the key?`)
    }

    this.stores[key] = new Store(config, key)

    return this
  },

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   *
   * @return Object
   */
  serialize() {
    return remap(this.stores, (store, key) => store.serialize(this.get(key)))
  },

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
  },

  /**
   * Alias for `serialize`
   * @return Object
   */
  toJSON() {
    return this.serialize()
  },

  /**
   * Returns a clone of the current application state
   * @return Object
   */
  toObject() {
    return this.valueOf()
  },

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
  },

  /**
   * Partially applies `push`.
   *
   * @param {Function} action - The action to bind
   * @param {...any} params - Prefilled arguments
   * @return function
   */
  prepare(action, ...params) {
    return this.push.bind(this, action, ...params)
  },

  /**
   * For a given STATE, revert all keys in a CHANGESET
   * to the original, unless new facts have changed the current value
   *
   * @param {Object} base
   * @param {Object} head
   */
  rollback(state, changes) {
    let resolution = remap(changes, (head, key) => {
      let base    = state[key]
      let current = this.get(key)

      return current !== head && current !== base ? current : base
    })

    this.update(resolution)
  },

  /**
   * Get the state managed by all stores that can respond to a given action
   */
  stateFor(action) {
    let stores = Object.keys(this.stores)
          .filter(key => Store.taskFor(this.stores[key], action))

    return stores.reduce((memo, key) => {
      memo[key] = this.get(key)
      return memo
    }, {})
  },

  /**
   * Resolves an action. If it resolved successfully, it dispatches that
   * the resulting parameters to registered stores for transformation.
   *
   * @param {Function} action - The action to dispatch
   * @param {...any} params - Arguments the action is called with
   * @return action result
   */
  push(action, ...params) {
    if (process.env.NODE_ENV !== 'production' && typeof action !== 'function') {
      throw TypeError(`Tried to push ${ action }, but is not a function.`)
    }

    tag(action)

    let changes = null
    let state   = this.stateFor(action)

    let resolve = body => {
      changes = this.dispatch(state, action, body)
      return this.update(changes)
    }

    let reject = () => {
      if (changes) {
        this.rollback(state, changes)
      }
    }

    return signal(resolve, reject, action.apply(this, params))
  },

  /**
   * Sends a message to each known store asking if it can respond to the
   * provided action. If so, takes the returned new state for that store's
   * managed key and assigns it as new state.
   *
   * @param {Object} state - The current state object to seed stores with
   * @param {Function} action - The action to send to each store
   * @param {any} body - The payload of the action
   */
  dispatch(state, action, body) {
    return remap(state, (subset, key) => {
      return Store.send(this.stores[key], action, subset, body)
    })
  }
})

module.exports   = Microcosm
Microcosm.get    = require('foliage/src/get')
Microcosm.set    = require('foliage/src/set')
Microcosm.remove = require('foliage/src/remove')
