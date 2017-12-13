/**
 * @flow
 */

let uid = 0
const FALLBACK = '_action'

/**
 * Uniquely tag a function. This is used to identify actions.
 */
export default function tag(fn: string | Command, name?: string): Command {
  console.assert(fn, `Unable to identify ${String(fn)} action.`)

  if (typeof fn === 'string') {
    return tag(n => n, fn)
  }

  if (fn.hasOwnProperty('toString')) {
    return fn
  }

  uid += 1

  const symbol = name || (fn.name || FALLBACK) + '-' + uid

  // Cast fn to keep Flow happy
  let cast: Tagged = fn

  cast.toString = () => symbol

  return fn
}
