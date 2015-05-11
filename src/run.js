/**
 * Run
 * Execute a list of callbacks
 */

module.exports = function (callbacks, args, scope) {
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i].apply(scope, args)
  }
}
