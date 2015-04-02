/**
 * getIn
 * Enumerate through a list of keys to get a value
 */

export default function getIn (obj, key) {
  let val  = obj
  let keys = [].concat(key)

  while(keys.length) {
    val = val[`${keys.shift()}`]
  }

  return val
}
