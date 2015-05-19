/**
 * Signal
 * Handles the various ways in which an action can be resolved. Currently,
 * it handles values, and promises
 */

function Signal (action, params, next) {
  if (process.env.NODE_ENV !== 'production' && typeof action !== 'function') {
    throw TypeError(`${ action } is not a function. Is app.push() being called with the wrong value?`)
  }

  let value = action.apply(null, params)

  // Actions some times return thenables. When this happens, wait for
  // them to resolve before moving on
  if (value && typeof value.then === 'function') {
    // Return a thenable without catching a rejection
    return value.then(next)
  }
  next(value)

  return value
}

module.exports = Signal
