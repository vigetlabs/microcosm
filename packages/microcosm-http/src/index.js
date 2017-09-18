export function getName(obj) {
  return obj.name.value
}

export function getValue(obj) {
  return obj.value.value
}

export function getType(type) {
  if (type.kind === 'ListType') {
    return getName(type.type)
  }

  return getName(type)
}

export function values(obj) {
  let values = Object.keys(obj)

  for (var i = 0; i < values.length; i++) {
    values[i] = obj[values[i]]
  }

  return values
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

  for (var i = 0; i < list.length; i++) {
    let item = list[i]

    if (matches(item, matchers) === true) {
      allowed.push(item)
    }
  }

  return allowed
}

export function reject(list, matchers) {
  let allowed = []

  for (var i = 0; i < list.length; i++) {
    let item = list[i]

    if (matches(item, matchers) === false) {
      allowed.push(item)
    }
  }

  return allowed
}

export function find(list, matchers) {
  for (var i = 0; i < list.length; i++) {
    let item = list[i]

    if (matches(item, matchers) === true) {
      return item
    }
  }

  return null
}
