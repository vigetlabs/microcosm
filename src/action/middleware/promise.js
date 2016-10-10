/**
 * This middleware provides support for Promises in Microcosm. When a
 * Promise is returned from a behavior, it will do the following:
 *
 * 1. Open the action
 * 2. Unwrap the promise using `setTimeout`, which prevents errors
 *    elsewhere in the dispatch execution process from being trapped.
 * 3. If the promise is rejected, reject the action
 * 4. Otherwise resolve the action with the returned body
 */

import isPromise from 'is-promise'

export default {

  condition: isPromise,

  call (action, promise) {
    action.open()

    promise.then(
      body  => global.setTimeout(() => action.resolve(body), 0),
      error => global.setTimeout(() => action.reject(error), 0)
    )

    return action
  }

}
