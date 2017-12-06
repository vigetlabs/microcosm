/**
 * @fileoverview This is the default update strategy for Microcosm. It
 * can be overriden by passing the `updater` option when creating a
 * Microcosm.
 *
 * The two types of updating provided by Microcosm are "immediate" and
 * "batching".
 *
 * When using batching, Microcosm leans on the requestIdleCallback
 * browser API. This batches together updates. It is configured with a
 * timeout such that a user never waits longer than 36 milliseconds
 * for an update.
 *
 * @flow
 */

import { merge } from './utils'
import { hasWindow, hasIdle } from './env'

export type Updater = (update: Function, options: Object) => void | *

export type Job = { cancel: () => void }

const BATCH_OPTIONS = { timeout: 36 }

function schedule(callback, options): ?Job {
  if (options.batch !== true) {
    callback()
    return null
  }

  if (hasWindow && hasIdle) {
    let job = window.requestIdleCallback(callback, options)

    return {
      cancel: window.cancelIdleCallback.bind(null, job)
    }
  }

  return {
    cancel: clearTimeout.bind(null, setTimeout(callback))
  }
}

export default function defaultUpdateStrategy(options: Object): Updater {
  let settings = merge(BATCH_OPTIONS, options)

  return update => schedule(update, settings)
}
