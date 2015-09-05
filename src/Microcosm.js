let Diode = require('diode')
let Transaction = require('./Transaction')
let coroutine = require('./coroutine')
let flatten = require('./flatten')
let install = require('./install')
let lifecycle = require('./lifecycle')
let send = require('./send')
let tag = require('./tag')
let eventually = require('./eventually')
let sortById = require('./sortById')
let has = require('./has')

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
  this.stores = []
  this.transactions = []
}

Microcosm.prototype = {
  constructor: Microcosm,

  getInitialState() {
    return this.dispatch({}, Transaction(lifecycle.willStart, this.state))
  },

  transactionWillUpdate(transaction, error, payload, complete) {
    transaction.error    = error
    transaction.payload  = payload
    transaction.complete = complete

    if (!complete && has(this.transactions, transaction) === false) {
      this.transactions = this.transactions.concat(transaction).sort(sortById)
    }
  },

  transactionWillClose(transaction) {
    // Return to object pooling
    Transaction.release(transaction)

    if (has(this.transactions, transaction)) {
      this.transactions.splice(this.transactions.indexOf(transaction), 1)
    }

    if (!transaction.error) {
      this.base = this.dispatch(this.base, transaction)
    }
  },

  /**
   * Dispatch all open transactions upon base state to determine
   * a new state. This is the state exposed to the outside world.
   */
  rollforward() {
    let next = this.transactions.reduce(this.dispatch.bind(this), this.base)

    if (next !== this.state) {
      this.state = next;
      this.emit(next)
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
    return this.stores.reduce(function(memo, item) {
      let key   = item[0]
      let store = item[1]

      memo[key] = send(store, state[key], transaction)

      return memo
    }, {})
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
    let transaction = Transaction(tag(action))
    let body = action.apply(null, flatten(params))

    return coroutine(body, (error, payload, complete) => {
      this.transactionWillUpdate(transaction, error, payload, complete)

      if (complete) {
        eventually(callback, this, error, payload)
        this.transactionWillClose(transaction)
      }

      this.rollforward()
    })
  },

  /**
   * Clear all outstanding transactions and assign base state
   * to a given object (or getInitialState())
   */
  reset(state, transactions=[]) {
    this.transactions = flatten(transactions) // Prevent accidental mutation
    this.base = Object.assign(this.getInitialState(), state)

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
    this.plugins.push({ app: this, options, ...config })
    return this
  },

  /**
   * Generates a store based on the provided `config` and assigns it to
   * manage the provided `key`. Whenever this store responds to an action,
   * it will be provided the current state for that particular key.
   */
  addStore(key, store) {
    if (process.env.NODE_ENV !== 'production' && arguments.length <= 1) {
      throw TypeError(`Microcosm::addStore expected string key but was given: ${ typeof key }. Did you forget to include the key?`)
    }

    this.stores.push([ key, store ])

    return this
  },

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   */
  serialize() {
    return this.dispatch(this.state, Transaction(lifecycle.willSerialize))
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

    return this.dispatch(data, Transaction(lifecycle.willDeserialize))
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
