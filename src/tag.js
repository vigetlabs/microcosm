/**
 * Tag
 * Given an object of methods, modify each method to
 * return a unique id when stringifyed
 */

import mapBy from './mapBy'

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
  return mapBy(Object.keys(actions), function(key) {
    const value = actions[key]
    return isFunction(value) ? decorate(value, key) : value
  })
}
