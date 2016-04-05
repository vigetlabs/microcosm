/**
 * Event subscription for Microcosm
 */

function Emitter (app) {
  var callbacks = []

  /**
   * Given a CALLBACK function, add it to the Set of all callbacks.
   */
  app.listen = app.subscribe = function (callback, scope, unshift) {
    let operation = unshift ? 'unshift' : 'push'
    callbacks[operation]({ callback: callback, scope: scope || app })
    return app
  }

  /**
   * Given a CALLBACK function, remove it from the set of callbacks.
   * Throws an error if the callback is not included in the set.
   */
  app.ignore = app.unsubscribe = function (unwanted) {
    callbacks = callbacks.filter(entry => entry.callback !== unwanted)
    return app
  }

  /**
   * Immediately trigger every callback
   */
  app.emit = app.publish = function () {
    for (var i = 0, size = callbacks.length; i < size; i++) {
      callbacks[i].callback.apply(callbacks[i].scope, arguments)
    }

    return app
  }

  return app
}

export default Emitter
