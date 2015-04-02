/**
 * getIn
 * Enumerate through a list of keys to get a value
 */

export default function getIn (target, key) {
  let keys = [].concat(key)

  while(keys.length) {
    target = target[`${keys.shift()}`]
  }

  return target
}
