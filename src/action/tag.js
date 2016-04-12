/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

import States from './states'

let uid = 0
const FALLBACK = 'microcosm_action'

export function formatTag (value) {
  return `${ value }`.replace(/_\d+$/, '')
}

export default function tag (fn, name) {
  /**
   * Respect strings and existing toString methods.
   */
  if (fn.__tagged) {
    return fn
  }

  fn.__tagged = true

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

  for (var key in States) {
    fn[key.toLowerCase()] = symbol + '_' + key
  }

  fn.done = symbol

  // The default state is done
  fn.toString = () => fn.done

  return fn
}
