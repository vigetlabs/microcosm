/**
 * Tag
 * Given an object of methods, modify each method to
 * return a unique id when stringifyed
 */

let uid = 0

let isFunction = value => typeof value === 'function'

let decorate = (fn, key) => {
  let copy = fn.bind(null)
  let id   = `_${ key }_${ uid++ }`

  copy.toString = () => id

  return copy
}

export default actions => {
  let keys = Object.keys(actions)

  return keys.reduce((memo, key) => {
    let value = actions[key]

    memo[key] = isFunction(value) ? decorate(value, key) : value

    return memo
  }, {})
}
