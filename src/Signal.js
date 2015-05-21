/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values, and promises
 */

function Signal (action, params) {
  if (process.env.NODE_ENV !== 'production' && typeof action !== 'function') {
    throw TypeError(`${ action } is not a function. Was app.push() called with the wrong value?`)
  }

  this.value = action(...params)
}

Signal.prototype = {
  pipe(next) {
    let { value } = this

    // Actions some times return thenables. When this happens, wait for
    // them to resolve before moving on
    if (value && typeof value.then === 'function') {
      // Return a thenable without catching a rejection
      return value.then(next)
    }

    next(value)

    return value
  }
}

module.exports = Signal
