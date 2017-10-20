export function generateKey(value, cache) {
  if (cache.has(value) === false) {
    cache.set(value, `${cache.size}`)
  }

  return cache.get(value)
}

export function hashcode(values, cache) {
  let code = ''

  if (Array.isArray(values)) {
    for (var i = 0, len = values.length; i < len; i++) {
      code += '-' + generateKey(values[i], cache)
    }
  } else {
    for (var key in values) {
      code += '-' + generateKey(values[key], cache)
    }
  }

  return `$${code}`
}
