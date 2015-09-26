let Diode = require('diode')
let Transaction = require('./Transaction')
let coroutine = require('./coroutine')
let eventually = require('./eventually')
let flatten = require('./flatten')
let install = require('./install')
let lifecycle = require('./lifecycle')
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

  this.plugins = []
  this.stores  = []
  this.history = Transaction(lifecycle.willStart, true)
}

Microcosm.prototype = {
  constructor: Microcosm,

  getInitialState() {
    return Transaction(lifecycle.willStart, this.state).dispatch(this.stores, {})
  },

  /**
   * Dispatch all open transactions upon base state to determine
   * a new state. This is the state exposed to the outside world.
   */
  rollforward() {
    this.state = this.history.flatten(this.stores, this.base)
    this.emit()

    return this
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

    this.history.append(transaction)

    return coroutine(body, (error, payload, complete) => {
      transaction.update(error, payload, complete)

      if (complete) {
        eventually(callback, this, error, payload)

        if (this.history.complete) {
          this.base    = this.history.dispatch(this.stores, this.base)
          this.history = this.history.next()
        }
      }

      this.rollforward()
    })
  },

  /**
   * Clear all outstanding transactions and assign base state
   * to a given object (or getInitialState())
   */
  reset(state) {
    this.history = Transaction(lifecycle.willReset, true)
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
    if (process.env.NODE_ENV !== 'production' && typeof key !== 'string') {
      throw TypeError(`Microcosm::addStore expects a string key to identify the store. Instead it got ${ typeof key }. Did you forget to include the key?`)
    }

    if (process.env.NODE_ENV !== 'production' && typeof store !== 'object') {
      throw TypeError(`Microcosm::addStore expects a store object as its second argument. Instead it got ${ typeof store }.`)
    }

    this.stores.push([ key, store ])

    this.rollforward()

    return this
  },

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   */
  serialize() {
    let transaction = Transaction(lifecycle.willSerialize, this.state)
    return transaction.dispatch(this.stores, this.state)
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

    let transaction = Transaction(lifecycle.willDeserialize, data)

    return transaction.dispatch(this.stores, data)
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
    // Queue plugins and then notify that installation has finished
    install(this.plugins, error => {
      callbacks.forEach(cb => cb.call(this, error, this))
    })

    return this
  }

}

module.exports = Microcosm
