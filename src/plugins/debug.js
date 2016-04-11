import lifecycle from '../lifecycle'

const Debug = {}

if (process.env.NODE_ENV !== 'production') {
  Debug[lifecycle.willAddStore] = function (app, store) {
    if (!store || typeof store !== 'function' && typeof store !== 'object') {
      throw TypeError('Expected a store object or function. Instead got: ' + store)
    }

    return store
  },

  Debug[lifecycle.willOpenTransaction] = function (app, transaction) {
    if (!app.started) {
      throw new Error('Cannot push: Did you forget to call app.start()?')
    }

    if (transaction.action == null) {
      throw new TypeError([
        `Unable to perform: app.push(${ transaction.action })\n`,
        `Because this action is ${ transaction.action }, our hunch is:`,
        '• The wrong key was requested of an object, like Actions.mispelledAction.',
        '• The wrong namespace was imported from an action module.'
      ].join('\n'))
    }

    return transaction
  }

}

export default Debug
