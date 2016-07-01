/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

import States from './states'

let uid = 0
const FALLBACK = 'microcosm_action'

export default function tag (fn, name) {
  if (fn.hasOwnProperty('toString')) {
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
  const symbol = name || (fn.name || FALLBACK) + '_' + uid

  for (var key in States) {
    fn[key] = symbol + '_' + key
  }

  fn.done = symbol

  // The default state is done
  fn.toString = () => fn.done

  return fn
}
