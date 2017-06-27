/**
 * @flow
 */

let uid = 0
const FALLBACK = '_action'

/**
 * Uniquely tag a function. This is used to identify actions.
 */
export default function tag(fn: Command | Tagged, name?: string): Tagged {
  console.assert(
    fn,
    `Unable to identify ${fn == null ? fn : fn.toString()} action.`
  )

  if (typeof fn === 'string') {
    return tag(n => n, fn)
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

  // Cast fn to keep Flow happy
  let cast: Tagged = fn

  cast.open = symbol + '.open'

  cast.loading = symbol + '.loading'
  cast.update = cast.loading

  cast.done = symbol // intentional for string actions
  cast.resolve = cast.done

  cast.error = symbol + '.error'
  cast.reject = cast.error

  cast.cancel = symbol + '.cancel'
  cast.cancelled = fn.cancel

  // The default state is done
  cast.toString = () => symbol

  // Mark the function as tagged so we only do this once
  fn.__tagged = true

  return cast
}
