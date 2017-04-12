/**
 * @fileoverview This is a custom update strategy for Microcosm.
 * It tells Microcosm to use the requestIdleCallback API for releasing
 * changes.
 */

// A lot of browsers don't support requestIdleCallback, so we patch it
import 'ric'

// Never let the user wait more than 24 milliseconds for an update
const options = { timeout: 24 }

export default function requestIdleBatch () {

  // Batching strategies return a function. This allows you to
  // maintain state within the closure above. Here, we keep track of
  // the last frame of work
  let frame = null

  return update => {
    if (frame == null) {
      frame = requestIdleCallback(() => {
        frame = null
        update()
      }, options)
    }
  }
}
