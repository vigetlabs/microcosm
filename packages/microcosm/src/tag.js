/**
 * @flow
 */

let uid = 0
const FALLBACK = '_action'

/**
 * Uniquely tag a function. This is used to identify actions.
 */
export function tag(fn: string | Command, name?: string): Command {
  if (typeof fn !== 'function') {
    return String(fn)
  }

  if (fn.hasOwnProperty('toString')) {
    return fn
  }

  const symbol = name || (fn.name || FALLBACK) + '-' + uid++

  // Cast fn to keep Flow happy
  let cast: Tagged = fn

  cast.toString = () => symbol

  return cast
}
