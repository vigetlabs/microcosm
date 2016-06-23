export function get (state, key) {
  return key == null ? state : state[key]
}

export function set (state, key, value) {
  if (typeof value === 'undefined') {
    return state
  }

  if (key == null) return value

  if (state && state[key] === value) {
    return state
  }

  return Object.assign({}, state, { [key] : value })
}
