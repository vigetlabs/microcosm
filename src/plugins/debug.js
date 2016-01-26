const Debug = {}

if (process.env.NODE_ENV !== 'production') {
  Debug.willAddStore = function (app, store) {
    if (!store || typeof store !== 'function' && typeof store !== 'object') {
      throw TypeError('Expected a store object or function. Instead got: ' + store)
    }

    return store
  },

  Debug.willOpenTransaction = function (app, transaction) {
    if (transaction.action == null) {
      throw new TypeError([
        `Unable to perform: app.push(${ transaction.action })\n`,
        'This typically happens when an action is accessed from the wrong key of an object, such as:\n',
        '• Actions.mispelledAction',
        '• import { mispelledAction } from "actions"'
      ].join('\n'))
    }

    return transaction
  }

}

export default Debug
