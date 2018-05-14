import assert from 'assert'

export function matches(item, matchers) {
  for (var key in matchers) {
    if (item[key] !== matchers[key]) {
      return false
    }
  }

  return true
}

export function filter(list, matchers) {
  assert(Array.isArray(list), 'Filter requires an array, got', list)

  return list.filter(item => matches(item, matchers))
}

export function find(list, matchers) {
  assert(Array.isArray(list), 'Find requires an array, got', list)

  for (var i = 0, len = list.length; i < len; i++) {
    let item = list[i]

    if (matches(item, matchers) === true) {
      return item
    }
  }

  return null
}
