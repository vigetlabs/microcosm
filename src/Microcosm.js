let Diode = require('diode')
let Transaction = require('./Transaction')
let Tree = require('./Tree')
let coroutine = require('./coroutine')
let dispatch = require('./dispatch')
let eventually = require('./eventually')
let flatten = require('./flatten')
let install = require('./install')
let lifecycle = require('./lifecycle')
let merge = require('./merge')
let tag = require('./tag')

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

  this.stores  = []
  this.plugins = []
  this.history = new Tree(Transaction(lifecycle.willStart, true, true))
}

Microcosm.prototype = {
  constructor: Microcosm,

  getInitialState() {
    return dispatch(this.stores, {}, Transaction(lifecycle.willStart, this.state))
  },

  /**
   * Dispatch all open transactions upon base state to determine
   * a new state. This is the state exposed to the outside world.
   */
  rollforward() {
    this.state = this.history.reduce((state, transaction) => {
      return dispatch(this.stores, state, transaction)
    }, merge({}, this.base))

    this.emit(this.state)

    return this
  },

  transactionWillOpen(transaction) {
    this.history.append(transaction)
  },

  transactionWillUpdate(transaction, error, payload, complete) {
    transaction.active   = !error
    transaction.complete = complete
    transaction.error    = error
    transaction.payload  = payload
  },

  transactionWillClose(transaction) {
    this.history.prune(this.clean, this)
  },

  shouldTransactionMerge() {
    return true
  },

  clean(transaction) {
    if (transaction.complete && this.shouldTransactionMerge(transaction)) {
      this.base = dispatch(this.stores, this.base, transaction)
      return true
    }

    return false
  },

  /**
   * Resolves an action. As that action signals changes, it will update
   * a unique transaction. If an error occurs, it will mark it for clean up
   * and the change will disappear from history.
   */
  push(action, params, callback) {
    let transaction = Transaction(tag(action))
    let body = action.apply(null, flatten(params))

    this.transactionWillOpen(transaction)

    return coroutine(body, (error, payload, complete) => {
      this.transactionWillUpdate(transaction, error, payload, complete)

      if (complete) {
        this.transactionWillClose(transaction)
        eventually(callback, this, error, payload)
      }

      this.rollforward()
    })
  },

  /**
   * Partially applies `push`.
   */
  prepare(action, params=[]) {
    return (more, callback) => this.push(action, flatten(params, more), callback)
  },

  /**
   * Clear all outstanding transactions and assign base state
   * to a given object (or getInitialState())
   */
  reset(state) {
    this.history = new Tree(Transaction(lifecycle.willReset, true, true))
    this.base = merge(this.getInitialState(), state)

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
    let plugin = merge({ app: this, options }, config)

    this.plugins.push(plugin)

    return this
  },

  /**
   * Generates a store based on the provided `config` and assigns it to
   * manage the provided `key`. Whenever this store responds to an action,
   * it will be provided the current state for that particular key.
   */
  addStore(key, store) {
    if (process.env.NODE_ENV !== 'production' && typeof key !== 'string') {
      throw TypeError(`Microcosm::addStore expects a string key to identify the config. Instead it got ${ typeof key }. Did you forget to include the key?`)
    }

    if (process.env.NODE_ENV !== 'production' && typeof store !== 'object') {
      throw TypeError(`Microcosm::addStore expects a store object as its second argument. Instead it got ${ typeof store }.`)
    }

    this.stores.push([ key, store ])

    // Re-evaluate the current state including the new store
    this.rollforward()

    return this
  },

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   */
  serialize() {
    return dispatch(this.stores, this.state, Transaction(lifecycle.willSerialize, this.state))
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

    return dispatch(this.stores, data, Transaction(lifecycle.willDeserialize, data))
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
   *    genrateed if installing plugins fails.
   */
  start(...callbacks) {
    install(this.plugins, error => {
      callbacks.forEach(cb => cb.call(this, error, this))
    })

    return this
  }

}

module.exports = Microcosm
