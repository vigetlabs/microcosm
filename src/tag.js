/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

let uid = 0

const FALLBACK = 'microcosm_action'

export function formatTag (value) {
  return `${ value }`.replace(/_\d+$/, '')
}

export default function tag (fn, name) {
  /**
   * Respect strings and existing toString methods.
   */
  if (typeof fn === 'string' || fn.hasOwnProperty('toString')) {
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
  var symbol = name || (fn.name || FALLBACK) + '_' + suffix

  fn.toString = () => symbol

  return fn
}
