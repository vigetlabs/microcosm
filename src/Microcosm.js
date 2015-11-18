import Diode       from 'diode'
import MetaStore   from './stores/meta'
import Transaction from './Transaction'
import Tree        from './Tree'
import coroutine   from './coroutine'
import defaults    from './defaults'
import dispatch    from './dispatch'
import eventually  from './eventually'
import flatten     from './flatten'
import install     from './install'
import lifecycle   from './lifecycle'
import merge       from './merge'
import tag         from './tag'

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
  this.history = new Tree()

  this.addStore(MetaStore)
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
    this.state = this.history.branch().reduce((state, transaction) => {
      return dispatch(this.stores, state, transaction)
    }, this.base)

    this.emit(this.state)

    return this
  },

  shouldHistoryKeep(transaction) {
    return false
  },

  clean(transaction) {
    if (transaction.complete && !this.shouldHistoryKeep(transaction)) {
      this.base = dispatch(this.stores, this.base, transaction)
      return true
    }
    return false
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

  transactionWillClose() {
    this.history.prune(transaction => this.clean(transaction))
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
    return (more=[], callback) => this.push(action, flatten(params, more), callback)
  },

  /**
   * Reset by pushing an action that will always return
   * a given state.
   */
  reset(state, callback) {
    return this.push(lifecycle.willReset, merge(this.getInitialState(), state), callback)
  },

  /**
   * Resets to a given state, passing it through deserialize first
   */
  replace(data, callback) {
    return this.reset(this.deserialize(data), callback)
  },

  /**
   * Pushes a plugin in to the registry for a given microcosm.
   * When `app.start()` is called, it will execute plugins in
   * the order in which they have been added using this function.
   */
  addPlugin(config, options) {
    if (process.env.NODE_ENV !== 'production') {
      if (!config) {
        throw TypeError('Expected a plugin, instead got ' + typeof config)
      }

      if (typeof config == 'object' && typeof config.register !== 'function') {
        throw TypeError('Expected plugin to have a register function, instead got ' + typeof config.register)
      }
    }

    let plugin = merge({ app: this, options }, defaults(config))

    this.plugins.push(plugin)

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

    if (process.env.NODE_ENV !== 'production') {
      if (!store || typeof store !== 'function' && typeof store !== 'object') {
        throw TypeError('Expected a store object or function. Instead got: ' + store)
      }
    }

    this.stores.push([ flatten(keyPath), defaults(store) ])

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
    return data == undefined ? this.state
                             : dispatch(this.stores, data, Transaction(lifecycle.willDeserialize, data))
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
  start(callback) {
    this.push(lifecycle.willStart)

    install(this.plugins, callback)

    return this
  }

}

export default Microcosm
