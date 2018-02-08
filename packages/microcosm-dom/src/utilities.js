export function identity(n) {
  return n
}

export function noop() {
  return null
}

export function advice(instance, method) {
  let proto = Object.getPrototypeOf(instance)
  let before = proto[method]
  let after = instance[method]

  if (before !== after) {
    instance[method] = function() {
      before.apply(instance, arguments)
      after.apply(instance, arguments)
    }
  }
}

export function shallowDiffers(a, b) {
  for (let key in a) if (a[key] !== b[key]) return true
  for (let key in b) if (!(key in a)) return true
  return false
}
