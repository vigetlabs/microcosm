/**
 * Prefix
 * Given an object, return a new object whos keys are prefixed with
 * a given string.
 *
 * This module is responsible for constructing action constants
 */

import transpose from './transpose'

export let identify = (str, key) => `${ str }-${ key }`

export default (obj, str) => {
  return transpose(obj, (value, key) => identify(str, key))
}
