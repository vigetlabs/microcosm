/**
 * Store
 * Used to provide default values for a store configuration
 */

let { willStart, willSerialize, willDeserialize } = require('./lifecycle')

exports.getInitialState = function (store) {
  return store.getInitialState ? store.getInitialState()
                               : exports.send(store, null, { type: willStart })
}

exports.serialize = function (store, state) {
  return store.serialize ? store.serialize(state)
                         : exports.send(store, state, { type: willSerialize })
}

exports.deserialize = function (store, raw) {
  return store.deserialize ? store.deserialize(raw)
                           : exports.send(store, raw, { type: willDeserialize })
}

exports.send = function (store, state, { payload, type }) {
  var handler = null

  if (typeof store === 'function') {
    handler = store()[type]
  } else {
    handler = store.register? store.register()[type] : false
  }

  return handler ? handler.call(store, state, payload) : state
}
