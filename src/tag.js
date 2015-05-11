/**
 * Tag
 * Given an object of methods, modify each method to
 * return a unique id when stringifyed
 */

let remap = require('./remap')
let uid    = 0

function decorate (fn, key) {
  if (typeof fn !== 'function') return fn

  uid += 1

  const copy = fn.bind(null)
  const tag  = `_${ key }_${ uid }`

  copy.toString = () => tag

  return copy
}

module.exports = function(actions) {
  return remap(actions, decorate)
}
