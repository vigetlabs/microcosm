/**
 * @fileoverview This is the default update strategy for Microcosm. It
 * can be overriden by passing the `updater` option when creating a
 * Microcosm.
 * @flow
 */

export type Updater = (update: Function, options: Object) => void | *

type UpdateOptions = {
  batch: boolean
}

const scheduler: Updater =
  typeof requestIdleCallback !== 'undefined'
    ? /* istanbul ignore next */ requestIdleCallback
    : (updater, options) => setTimeout(updater, options.timeout)

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
