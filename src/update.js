import merge from './merge'

export function get (target, keys) {
  for (var i = 0, size = keys.length; target !== undefined && i < size; i++) {
    target = target[keys[i]]
  }

  return target
}

export function set (target, keys, value) {
  if (keys.length) {
    let head  = keys[0]
    let clone = merge({}, target)

    clone[head] = keys.length > 1 ? set(clone[head], keys.slice(1), value) : value

    return clone
  } else {
    return value
  }
}
