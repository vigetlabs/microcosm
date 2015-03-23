/**
 * Tag
 * Given an object of methods, modify each method to
 * return a unique id when stringifyed
 */

import transpose from 'transpose'

let uid = 0

export let infuse = fn => {
  let copy = fn.bind(null)
  let id   = `_microcosm-${ uid++ }`

  copy.toString = () => id

  return copy
}

export default actions => transpose(actions, infuse)
