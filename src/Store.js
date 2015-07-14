/**
 * Store
 * Used to provide default values for a store configuration
 */

exports.getInitialState = function (store) {
  if ('getInitialState' in store) {
    return store.getInitialState()
  }
}

exports.serialize = function (store, state) {
  return 'serialize' in store ? store.serialize(state) : state
}

exports.deserialize = function (store, raw) {
  return 'deserialize' in store ? store.deserialize(raw) : raw
}

exports.send = function (store, state, { payload, type }) {
  let handler = 'register' in store ? store.register()[type] : false

  return handler ? handler.call(store, state, payload) : state
}
