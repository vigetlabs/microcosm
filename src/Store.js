/**
 * Store
 * Used to provide default values for a store configuration
 */

let identity = i => i
let isDev    = process.env.NODE_ENV !== 'production'

function Store (config, id) {
  Object.assign(this, config)
  this.toString = () => id
}

Store.prototype = {
  getInitialState : identity,
  serialize       : identity,
  deserialize     : identity,

  register() {
    return {}
  }
}

Store.send = function (store, action, state, params) {
  let tasks = store.register()
  let task  = tasks[action]

  if (isDev && action in tasks && typeof task !== 'function') {
    throw TypeError(`${ store } registered ${ action } with non-function value`)
  }

  return task ? task.call(store, state, params) : state
}

module.exports = Store
