import { isString } from './utils'

let uid = 0
const FALLBACK = '_action'

/**
 * Uniquely tag a function. This is used to identify actions.
 * @param {Function} fn The target function to add action identifiers to.
 * @param {String} [name] An override to use instead of `fn.name`.
 * @return {Function} The tagged function (same as `fn`).
 */
export default function tag(fn, name) {
  console.assert(fn, `Unable to identify ${fn} action.`)

  if (fn.__tagged === true) {
    return fn
  }

  if (isString(fn)) {
    name = fn
    fn = n => n
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
