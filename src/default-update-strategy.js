/**
 * @fileoverview This is the default update strategy for Microcosm. It
 * can be overriden by passing the `updater` option when creating a
 * Microcosm.
 */

/**
 * requestIdleCallback isn't supported everywhere and is hard to
 * polyfill. For environments that do not support it, just use a
 * setTimeout.
 *
 * Note: To be fully compliant, we would invoke the callback with the
 * time remaining. Given our usage, we don't need to do that.
 */
const scheduler = global.requestIdleCallback || (update => setTimeout(update, 4))

/**
 * When using requestIdleCallback, batch together updates until the
 * browser is ready for them, but never make the user wait longer than
 * 36 milliseconds.
 */
const BATCH_OPTIONS = { timeout: 36 }

export default function defaultUpdateStrategy (options) {

  return update => {
    if (options.batch === true) {
      scheduler(update, BATCH_OPTIONS)
    } else {
      update()
    }
  }
}
