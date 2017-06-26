/**
 * @fileoverview This is the default update strategy for Microcosm. It
 * can be overriden by passing the `updater` option when creating a
 * Microcosm.
 * @flow
 */

/**
 * requestIdleCallback isn't supported everywhere and is hard to
 * polyfill. For environments that do not support it, just use a
 * setTimeout.
 *
 * Note: To be fully compliant, we would invoke the callback with the
 * time remaining. Given our usage, we don't need to do that.
 * @private
 */

export type Updater = (update: Function, options: Object) => void | *

type UpdateOptions = {
  batch: boolean
}

const scheduler: Updater =
  global.requestIdleCallback || (update => setTimeout(update, 4))

/**
 * When using requestIdleCallback, batch together updates until the
 * browser is ready for them, but never make the user wait longer than
 * 36 milliseconds.
 * @private
 */
const BATCH_OPTIONS = { timeout: 36 }

export default function defaultUpdateStrategy(options: UpdateOptions): Updater {
  return update => {
    if (options.batch === true) {
      scheduler(update, BATCH_OPTIONS)
    } else {
      update()
    }
  }
}
