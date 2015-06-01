/**
 * Store
 * Used to provide default values for a store configuration
 */

let skip = i => i

function Store (config, id) {
  // Fold configuration over self
  for (var i in config) {
    this[i] = config[i]
  }

  this.toString = () => id
}

Store.prototype = {
  getInitialState : skip,
  serialize       : skip,
  deserialize     : skip,

  register() {
    return {}
  },

  send(state, action, params) {
    let task  = this.register()[action]
    return task? task.call(this, state, params) : state
  }
}

module.exports = Store
