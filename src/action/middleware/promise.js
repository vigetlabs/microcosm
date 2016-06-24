import unpromise from  './promise/unpromise'
import isPromise from 'is-promise'

/**
 * This middleware provides support for Promises in Microcosm. When a
 * Promise is returned from a behavior, it will do the following:
 *
 * 1. Open the action
 * 2. Unwrap the promise using `unpromise`, which prevents errors
 *    elsewhere in the dispatch execution process from being trapped.
 * 3. If the promise is rejected, reject the action
 * 4. Otherwise close the action with the returned body
 */
export default {

  condition(value) {
    return isPromise(value)
  },

  call(action, promise) {
    action.open()

    unpromise(promise, function (error, body) {
      if (error) {
        action.reject(error)
      } else {
        action.close(body)
      }
    })

    return action
  }

}
