import States from './action/states'

let uid = 0
const FALLBACK = 'microcosm_action'

/**
 * Uniquely tag a function. This is used to identify actions.
 *
 * @param {function} fn The target function to add action identifiers to.
 * @param {string} [name] An override to use instead of `fn.name`.
 * @return {function} The tagged function (same as `fn`).
 * @private
 */
export default function tag (fn, name) {
  if (fn == null) {
    throw new TypeError('Unable to identify ' + fn + ' action. Did you push the correct action?')
  }

  if (fn.hasOwnProperty('toString')) {
    return fn
  }

  if (typeof fn === 'string') {
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
  const symbol = name || (fn.name || FALLBACK) + '_' + uid

  for (var key in States) {
    fn[key] = symbol + '_' + key
  }

  fn.done = symbol

  // The default state is done
  fn.toString = () => fn.done

  return fn
}
