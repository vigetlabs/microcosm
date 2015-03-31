/**
 * Tag
 * Given an object of methods, modify each method to
 * return a unique id when stringifyed
 */

import remap from './remap'

let uid = 0

function isFunction (value) {
  return typeof value === 'function'
}

function decorate (fn, key) {
  const copy = fn.bind(null)
  const id   = `_${ key }_${ uid++ }`

  copy.toString = () => id

  return copy
}

export default actions => {
  return remap(actions, function(value, key) {
    return isFunction(value) ? decorate(value, key) : value
  })
}
