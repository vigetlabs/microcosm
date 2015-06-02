/**
 * Run
 * Execute a list of callbacks
 */

module.exports = function (callbacks, args, scope, origin) {
  for (let i = 0; i < callbacks.length; i++) {

    if (process.env.NODE_ENV !== 'production' && typeof callbacks[i] !== 'function') {
      throw TypeError(`Microcosm::${origin} expected callback but instead got: ${typeof callbacks[i]}`)
    }

    callbacks[i].apply(scope, args)
  }
}
