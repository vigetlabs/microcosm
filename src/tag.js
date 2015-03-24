/**
 * Tag
 * Given an object of methods, modify each method to
 * return a unique id when stringifyed
 */

let uid = 0

let decorate = fn => {
  let copy = fn.bind(null)
  let id   = `_microcosm-${ uid++ }`

  copy.toString = () => id

  return copy
}

export default actions => {
  let keys = Object.keys(actions)

  return keys.reduce((memo, key) => {
    memo[key] = decorate(actions[key], key)
    return memo
  }, {})
}
