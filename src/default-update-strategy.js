/**
 * @fileoverview This is the default update strategy for Microcosm. It
 * can be overriden by passing the `updater` option when creating a
 * Microcosm.
 */

// requestIdleCallback isn't supported everywhere
import 'ric'

let batchOptions = { timeout: 36 }

export default function defaultUpdateStrategy (options) {

  return update => {
    if (options.batch === true) {
      global.requestIdleCallback(update, batchOptions)
    } else {
      update()
    }
  }
}
