/**
 * Microcosm
 * A variant of Flux with central, isolated state.
 *
 * Microcosm makes it easier to control and modify state. It uses
 * pure, singleton Stores and Actions, keeping all state encapsulated
 * in one place.
 */

let Diode   = require('diode')
let Store   = require('./Store')
let install = require('./install')
let plugin  = require('./plugin')
let remap   = require('./remap')
let signal  = require('./signal')

let Microcosm = function() {
  /**
   * Microcosm uses Diode for event emission. Diode is an event emitter
   * with a single event.
   * https://github.com/vigetlabs/diode
   */
  Diode(this)

  this.base         = {}
  this.state        = this.base

  this.plugins      = []
  this.stores       = {}
  this.transactions = []
}

Microcosm.prototype = {
  constructor: Microcosm,

  /**
   * Generates the initial state a microcosm starts with. Called whenever
   * a microcosm runs start().
   */
  getInitialState() {
    return remap(this.stores, Store.getInitialState)
  },

  /**
   * Given a state and transaction, return a transformed state
   * based upon Stores that can respond to the transaction.
   */
  dispatch(state, transaction) {
    // Don't bother if the transaction has no body
    if ('body' in transaction === false) {
      return state
    }

    return remap(this.stores, (store, key) => {
      return Store.send(store, state[key], transaction)
    })
  },

  /**
   * For each transaction, determine if it can be "squashed down" into
   * base state.
   *
   * Note: This is an internal operation and will not emit a change. No
   * "public" state is modified
   */
  rebase() {
    // Until coming across an incomplete transaction...
    while (this.transactions.length && this.transactions[0].done) {

      // ... extract out the earliest transaction...
      let change = this.transactions.shift()

      // ... and merge it into base state if there are no errors.
      if (!change.error) {
        this.base = this.dispatch(this.base, change)
      }
    }
  },

  /**
   * The core state modification function. `rollforward` squashes down
   * changes that can be deallocated and then then applies "pending" changes
   * on top.
   *
   * If state changes, it will emit en event.
   */
  rollforward() {
    let old = this.state

    this.rebase()

    let next = this.transactions.reduce(this.dispatch.bind(this), this.base)

    if (next !== old) {
      this.state = next
      this.emit(next, old)
    }
  },

  /**
   * Partially applies `push`.
   */
  prepare(action, ...params) {
    return this.push.bind(this, action, ...params)
  },

  /**
   * Resolves an action. As that action signals changes, it will update
   * a unique transaction. If an error occurs, it will mark it for clean up
   * and the change will disappear from history.
   */
  push(action, ...params) {
    if (process.env.NODE_ENV !== 'production' && typeof action !== 'function') {
      throw TypeError(`Tried to push ${ action }, but is not a function.`)
    }

    let transaction = { action, done: false }

    this.transactions.push(transaction)

    return signal((error, body, done) => {
      if (error) {
        transaction.done  = true
        transaction.error = error
      }

      if (!transaction.done) {
        transaction.body = body
      }

      transaction.done = transaction.done || done

      this.rollforward()

      return body
    }, action.apply(this, params))
  },

  /**
   * Clear all outstanding transactions and assign base state
   * to a given object (or getInitialState())
   */
  reset(state = this.getInitialState()) {
    this.transactions = []
    this.base = state

    return this.rollforward()
  },

  /**
   * Resets to a given state, passing it through deserialize first
   */
  replace(data) {
    return this.reset(this.deserialize(data))
  },

  /**
   * Pushes a plugin in to the registry for a given microcosm.
   * When `app.start()` is called, it will execute plugins in
   * the order in which they have been added using this function.
   */
  addPlugin(config, options) {
    this.plugins.push(plugin(config, options, this))
    return this
  },

  /**
   * Generates a store based on the provided `config` and assigns it to
   * manage the provided `key`. Whenever this store responds to an action,
   * it will be provided the current state for that particular key.
   */
  addStore(key, config) {
    if (process.env.NODE_ENV !== 'production' && arguments.length <= 1) {
      throw TypeError(`Microcosm::addStore expected string key but was given: ${ typeof key }. Did you forget to include the key?`)
    }

    this.stores[key] = config

    return this
  },

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   */
  serialize() {
    return remap(this.stores, (store, key) => Store.serialize(store, this.state[key]))
  },

  /**
   * For each key in the provided `data` parameter, transform it using
   * the `deserialize` method provided by the store managing that key.
   * Then fold the deserialized data over the current application state.
   */
  deserialize(data) {
    if (data == void 0) {
      return this.state
    }

    return remap(this.stores, (store, key) => {
      return Store.deserialize(store, data[key], data[key])
    })
  },

  /**
   * Alias for `serialize`
   */
  toJSON() {
    return this.serialize()
  },

  /**
   * Starts an application. It does a couple of things:
   *
   * 1. Calls `this.reset()` to determine initial state
   * 2. Runs through all plugins, it will terminate if any fail
   * 3. Executes the provided callback, passing along any errors
   *    generated if installing plugins fails.
   */
  start(...callbacks) {
    this.reset()

    // Queue plugins and then notify that installation has finished
    install(this.plugins, error => {
      callbacks.forEach(cb => cb.call(this, error, this))
    })

    return this
  }
}

module.exports = Microcosm
