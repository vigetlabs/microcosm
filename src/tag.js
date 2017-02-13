let uid = 0
const FALLBACK = '_action'

const toString = function () {
  return this.done
}

/**
 * Uniquely tag a function. This is used to identify actions.
 * @param {Function} fn The target function to add action identifiers to.
 * @param {String} [name] An override to use instead of `fn.name`.
 * @return {Function} The tagged function (same as `fn`).
 */
export default function tag (fn, name) {
  if (fn == null) {
    throw new Error(`Unable to identify ${fn} action`)
  }

  if (fn.done) {
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
  const symbol = name || (fn.name || FALLBACK) + '.' + uid

  fn.open = symbol + '.open'

  fn.loading = symbol + '.loading'
  fn.update = fn.loading

  fn.done = symbol // intentional
  fn.resolve = fn.done

  fn.error = symbol + '.error'
  fn.reject = fn.error

  fn.cancelled = symbol + '.cancelled'
  fn.cancel = fn.cancelled

  // The default state is done
  fn.toString = toString

  return fn
}
