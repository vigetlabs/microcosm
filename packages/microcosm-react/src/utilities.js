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
