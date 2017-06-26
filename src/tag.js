/**
 * @flow
 */

import { isString } from './utils'

let uid = 0
const FALLBACK = '_action'

/**
 * Uniquely tag a function. This is used to identify actions.
 */
export default function tag(fn: Tagged | Command, name?: string): Tagged {
  console.assert(
    fn,
    `Unable to identify ${fn == null ? fn : fn.toString()} action.`
  )

  if (typeof fn === 'string') {
    return tag({ toString: () => fn.toString() }, fn.toString())
  }

  if (fn.__tagged === true) {
    return fn
  }

  /**
   * Auto-increment a stepper suffix to prevent two actions with the
   * same name from colliding.
   */
  uid += 1

  /**
   * Function.name lacks legacy support. For these browsers, fallback
   * to a consistent name:
   */
  const symbol = name || (fn.name || FALLBACK) + '.' + uid

  fn.open = symbol + '.open'

  fn.loading = symbol + '.loading'
  fn.update = fn.loading

  fn.done = symbol // intentional for string actions
  fn.resolve = fn.done

  fn.error = symbol + '.error'
  fn.reject = fn.error

  fn.cancel = symbol + '.cancel'
  fn.cancelled = fn.cancel

  // The default state is done
  fn.toString = () => symbol

  // Mark the function as tagged so we only do this once
  fn.__tagged = true

  return fn
}
