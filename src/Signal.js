/**
 * Signal
 * Handles the various ways in which an action can be resolved. Currently,
 * it handles values, promises, and error-first callbacks
 */

function Signal (action, params, next) {
  if (typeof action !== 'function') {
    throw TypeError(`${ action } is not a function. Is app.push() being called with the wrong value?`)
  }

  let strategy = action.length >= 2 ? withCallback : withValue

  return strategy(action, params, next)
}

// addresses cases where the signature of an action is
// action(params, next)
function withCallback (action, params, next) {
  return action(params, next)
}

// addresses cases where a value is returned. If that value
// is a promise, wait for it to resolve before passing the torch
function withValue (action, params, next) {
  let value = action(params)

  // Actions some times return thenables. When this happens, wait for
  // them to resolve before moving on
  if (value && typeof value.then === 'function') {
    // Report for callbacks that this failed
    value.then(null, next)

    // Return a thenable without catching a rejection
    return value.then(result => next(null, result))
  }

  next(null, value)

  return value
}

module.exports = Signal
