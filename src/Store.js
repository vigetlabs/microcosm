/**
 * Store
 * Used to provide default values for a store configuration
 */

function Store (config, id) {
  // Fold configuration over self
  for (var i in config) {
    this[i] = config[i]
  }

  this.toString = () => id
}

Store.prototype = {
  getInitialState() {},

  willRespondTo(action) {
    return action in this
  },

  transform(state, action, params) {
    return this.willRespondTo(action) ? this[action](state, params) : state
  },

  serialize(state) {
    return state
  },

  deserialize(state) {
    return state
  }
}

module.exports = Store
