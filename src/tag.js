/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

let uid = 0

export default function tag (fn, name) {
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
   * Auto-increment a stepper suffix to prevent two actions with the
   * same name from colliding.
   */
  var suffix = uid++

  /**
   * Function.name lacks legacy support. For these browsers, fallback
   * to a consistent name:
   */
  var symbol = name || (fn.name || 'microcosm_action') + '_' + suffix

  fn.toString = () => symbol

  return fn
}
