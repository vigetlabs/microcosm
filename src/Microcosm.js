import Diode     from 'diode'
import MetaStore from './stores/meta'
import Tree      from './Tree'
import dispatch  from './dispatch'
import lifecycle from './lifecycle'
import memorize  from './memorize'

function Microcosm (config = {}) {
  Diode(this)

  this.maxHistory = 'maxHistory' in config ? config.maxHistory : Infinity

  this.cache    = {}
  this.state    = {}
  this.registry = {}
  this.stores   = []
  this.history  = new Tree()

  // Standard store reduction behaviors
  this.addStore(MetaStore)
}

Microcosm.prototype = {
  constructor: Microcosm,

  getInitialState() {
    return this.dispatch({}, { type: lifecycle.willStart, payload: this.state })
  },

  shouldHistoryKeep() {
    return this.maxHistory > 0 && this.history.size() <= this.maxHistory
  },

  clean(action) {
    if (action.is('failed')) {
      return true
    }

    if (action.is('done') && this.shouldHistoryKeep() === false) {
      this.cache = this.dispatch(this.cache, action)

      return true
    }

    return false
  },

  rollforward() {
    this.history.prune(this.clean, this)

    this.state = this.history.reduce(this.dispatch, this.cache, this)

    this.emit(this.state)

    return this
  },

  dispatch(state, { type, payload }) {
    if (!this.registry[type]) {
      this.registry[type] = memorize(this.stores, type)
    }

    return dispatch(state, this.registry[type], payload)
  },

  push(type, ...params) {
    let action = this.history.append(type)

    action.on('change', this.rollforward.bind(this))

    return action.execute(...params)
  },

  addStore(keyPath, store) {
    if (arguments.length < 2) {
      // Important! Assignment this way is important
      // to support IE9, which has an odd way of referencing
      // arguments
      store   = keyPath
      keyPath = null
    }

    if (typeof store === 'function') {
      store = { register: store }
    }

    this.stores = this.stores.concat([[ keyPath, store ]])

    this.rebase()

    return this
  },

  reset(state) {
    return this.push(lifecycle.willReset, Object.assign(this.getInitialState(), state))
  },

  replace(data) {
    return this.reset(this.deserialize(data))
  },

  serialize() {
    return this.dispatch(this.state, { type: lifecycle.willSerialize, payload: this.state })
  },

  deserialize(payload) {
    if (payload != null) {
      return this.dispatch(payload, { type: lifecycle.willDeserialize, payload })
    }
  },

  toJSON() {
    return this.serialize()
  },

  rebase() {
    this.registry = {}
    this.cache = Object.assign(this.getInitialState(), this.cache)

    this.rollforward()
  },

  fork(stores) {
    const clone = Object.create(this)

    if (Array.isArray(stores)) {
      stores.forEach(store => clone.addStore(store))
    } else if (stores && typeof stores === 'object') {
      Object.keys(stores).forEach(function(key) {
        clone.addStore(key, stores[key])
      })
    } else if (stores) {
      clone.addStore(stores)
    }

    return clone
  }
}

export default Microcosm
