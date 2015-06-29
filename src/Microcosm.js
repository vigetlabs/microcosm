let Diode       = require('diode')
let Store       = require('./Store')
let Transaction = require('./Transaction')
let install     = require('./install')
let plugin      = require('./plugin')
let remap       = require('./remap')

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
   * Called before a transaction is squashed into base state. This method
   * is useful to override if you wish to preserve transaction history
   * beyond outstanding transactions.
   */
  shouldTransactionMerge(item, all) {
    return item.done
  },

  /**
   * Used to determine if a transaction should be purged during `clean()`
   */
  transactionIsValid(item) {
    return !item.error
  },

  /*
   * Before dispatching, this function is called on every transaction
   */
  shouldTransactionDispatch(item) {
    return item.active
  },

  /**
   * Remove invalid transactions
   */
  clean() {
    this.transactions = this.transactions.filter(this.transactionIsValid)
  },

  /**
   * Starting from the beginning, consecutively fold complete transactions into
   * base state and remove them from the transaction list.
   */
  squash() {
    while (this.transactions.length && this.shouldTransactionMerge(this.transactions[0], this.transactions)) {
      this.base = this.dispatch(this.base, this.transactions.shift())
    }
  },

  /**
   * Dispatch all outstanding, active transactions upon base state to determine
   * a new state. This is the state exposed to the outside world.
   */
  rollforward() {
    let next = this.transactions.filter(this.shouldTransactionDispatch)
                                .reduce(this.dispatch.bind(this), this.base)

    if (next !== this.state) {
      this.state = next
      this.emit(this.state)
    }
  },

  /**
   * Engages the transaction life cycle.
   *
   * 1. Clean up erroneous transactions
   * 2. Squash down complete transactions
   * 3. Roll outstanding changes forward into new state
   */
  transact() {
    this.clean()
    this.squash()
    this.rollforward()
  },

  dispatch(state, transaction) {
    return remap(this.stores, function(store, key) {
      return Store.send(store, state[key], transaction)
    })
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

    let transaction = new Transaction(action, params, this.transact.bind(this))

    transaction.listen(this.transact.bind(this))

    this.transactions.push(transaction)

    return transaction.run(params)
  },

  /**
   * Clear all outstanding transactions and assign base state
   * to a given object (or getInitialState())
   */
  reset(state=this.getInitialState(), transactions=[]) {
    this.transactions = transactions
    this.base = state

    return this.transact()
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
