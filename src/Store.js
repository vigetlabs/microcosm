/**
 * Store
 * Used to provide default values for a store configuration
 */

exports.getInitialState = function (store) {
  return store.getInitialState? store.getInitialState() : undefined
}

exports.serialize = function (store, state) {
  return store.serialize? store.serialize(state) : state
}

exports.deserialize = function (store, raw) {
  return store.deserialize? store.deserialize(raw) : raw
}

exports.send = function (store, state, { payload, type }) {
  let handler = store.register? store.register()[type] : false

  return handler ? handler.call(store, state, payload) : state
}
