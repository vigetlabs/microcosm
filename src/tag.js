/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

let uid = 0

export default function (fn) {
  if (process.env.NODE_ENV !== 'production' && (typeof fn !== 'function')) {
    throw TypeError('Attempted to tag an action, but the provided value is not a function. Instead got ' + typeof fn)
  }

  /**
   * Respect existing toString methods.
   */
  if (fn.hasOwnProperty('toString')) {
    return fn
  }

  /**
   * Function.name lacks legacy support. For these browsers, fallback
   * to a consistent name:
   */
  var name = fn.name || 'microcosm_action'

  /**
   * Auto-increment a stepper suffix to prevent two actions with the
   * same name from colliding.
   */
  var suffix = uid++

  fn.toString = () => `${ name }_${ suffix }`

  return fn
}
