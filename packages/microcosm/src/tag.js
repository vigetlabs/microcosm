/**
 * @flow
 */

let uid = 0
const FALLBACK = '_action'

/**
 * Uniquely tag a function. This is used to identify actions.
 */
export function tag(fn: string | Command, name?: string): Command {
  console.assert(fn != undefined, `Can not tag action. Value is ${fn}.`)

  if (typeof fn !== 'function') {
    return '' + fn
  }

  if (fn.hasOwnProperty('toString')) {
    return fn
  }

  let symbol = name || (fn.name || FALLBACK) + '-' + uid++

  fn.toString = () => symbol

  return fn
}
