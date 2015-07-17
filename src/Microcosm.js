let Diode = require('diode')
let Store = require('./Store')
let Transaction = require('./Transaction')
let flatten = require('./flatten')
let install = require('./install')
let plugin = require('./plugin')
let remap = require('./remap')
let tag = require('./tag')

const EMPTY_ARRAY = []

let Microcosm = function() {
  /**
   * Microcosm uses Diode for event emission. Diode is an event emitter
   * with a single event.
   * https://github.com/vigetlabs/diode
   */
  Diode(this)

  /**
   * Represents all "merged" transactions. Whenever a transaction completes,
   * the result is folded into base state and the transaction object is
   * "released". This lets transactions execute in a predicable order while
   * not soaking up memory keeping them forever.
   */
  this.base = {}

  /**
   * Holds publically available state. The result of folding all incomplete
   * transactions over base state. This property can safely be referenced when
   * retrieving application state.
   */
  this.state = this.base

  this.plugins = []
  this.stores = {}
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
   * Called before a transaction is squashed into base state. This method
   * is useful to override if you wish to preserve transaction history
   * beyond outstanding transactions.
   */
  shouldTransactionMerge(transaction) {
    return transaction.meta.done
  },

  /*
   * Before dispatching, this function is called on every transaction
   */
  shouldTransactionDispatch(transaction) {
    return transaction.meta.active
  },

  /**
   * Remove a transactions
   */
  release(transaction) {
    this.transactions.splice(this.transactions.indexOf(transaction), 1)

    return this.rollforward()
  },

  /**
   * Starting from the beginning, consecutively fold complete transactions into
   * base state and remove them from the transaction list.
   */
   reconcile() {
     let first = this.transactions[0]

     if (this.shouldTransactionMerge(first, this.transactions)) {
       this.base = this.dispatch(this.base, first)
       return this.release(first)
     }

     return this.rollforward()
   },

  /**
   * Dispatch all outstanding, active transactions upon base state to determine
   * a new state. This is the state exposed to the outside world.
   */
  rollforward() {
    let next = this.transactions.reduce(this.dispatch.bind(this), this.base)

    if (next !== this.state) {
      this.state = next
      this.emit(this.state)
    }

    return this
  },

  /**
   * Dispatch takes an existing state and performs the result of a transaction
   * on top of it. This is different than other Flux implementations, there
   * are no side-effects.
   *
   * Dispatch answers the question:
   * "What will change when I account for a transaction?"
   */
  dispatch(state, transaction) {
    if (this.shouldTransactionDispatch(transaction) === false) {
      return state
    }

    return remap(this.stores, function(store, key) {
      return Store.send(store, state[key], transaction)
    })
  },

  /**
   * Partially applies `push`.
   */
  prepare(action, params=[]) {
    return (more, callback) => this.push(action, flatten(params, more), callback)
  },

  /**
   * Resolves an action. As that action signals changes, it will update
   * a unique transaction. If an error occurs, it will mark it for clean up
   * and the change will disappear from history.
   */
  push(action, params, callback) {
    if (process.env.NODE_ENV !== 'production' && typeof action !== 'function') {
      throw TypeError(`Tried to create Transaction for ${ action }, but it is not a function.`)
    }

    let transaction = Transaction.create(tag(action).toString())
    let body = action.apply(null, flatten(params))

    this.transactions.push(transaction)

    return Transaction.run(transaction, body, this.reconcile, this.release, callback, this)
  },

  /**
   * Clear all outstanding transactions and assign base state
   * to a given object (or getInitialState())
   */
  reset(state=this.getInitialState(), transactions=EMPTY_ARRAY) {
    this.transactions = flatten(transactions) // Prevent accidental mutation
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

    return remap(this.stores, function(store, key) {
      return Store.deserialize(store, data[key])
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
