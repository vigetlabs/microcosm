import { clone } from 'microcosm'

/**
 * Immutably update an object, but do not clone if the base reference
 * has changed.
 */
export function assign(target, key, value, original) {
  if (!original || (target === original && original[key] !== value)) {
    target = clone(target)
  }

  target[key] = value

  return target
}

export function getName(obj) {
  return obj.alias ? obj.alias.value : obj.name.value
}

export function getType(field) {
  let type = field.type

  if (type.kind === 'ListType') {
    return getName(type.type)
  }

  return getName(type)
}

export function matches(item, matchers) {
  for (var key in matchers) {
    if (item[key] !== matchers[key]) {
      return false
    }
  }

  return true
}

export function filter(list, matchers) {
  let allowed = []

  for (var i = 0, len = list.length; i < len; i++) {
    let item = list[i]

    if (matches(item, matchers) === true) {
      allowed.push(item)
    }
  }

  return allowed
}

export function reject(list, matchers) {
  let allowed = []

  for (var i = 0, len = list.length; i < len; i++) {
    let item = list[i]

    if (matches(item, matchers) === false) {
      allowed.push(item)
    }
  }

  return allowed
}

export function find(list, matchers) {
  for (var i = 0, len = list.length; i < len; i++) {
    let item = list[i]

    if (matches(item, matchers) === true) {
      return item
    }
  }

  return null
}

export function reduceName(list, callback, extra) {
  let answer = {}

  for (var i = 0, len = list.length; i < len; i++) {
    var name = getName(list[i])
    answer[name] = callback(list[i], name, extra)
  }

  return answer
}
