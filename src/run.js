/**
 * Run
 * Execute a list of callbacks
 */

const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = function (callbacks, args, scope) {
  for (let i = 0; i < callbacks.length; i++) {

    if (isDevelopment && typeof callbacks[i] !== 'function') {
      throw TypeError('Microcosm expected callback but instead got: ' + typeof callbacks[i])
    }

    callbacks[i].apply(scope, args)
  }
}
