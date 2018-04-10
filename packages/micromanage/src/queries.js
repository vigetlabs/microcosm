export function matches(matchers, item) {
  for (var key in matchers) {
    if (item.hasOwnProperty(key) === false || item[key] !== matchers[key]) {
      return false
    }
  }

  return true
}

export function where(criteria) {
  return items => items.filter(matches.bind(null, criteria))
}
