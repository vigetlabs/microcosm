export function identity(n) {
  return n
}

export function noop() {
  return null
}

export function advice(Class, instance, method) {
  let before = Class.prototype[method]
  let after = instance[method]

  if (before !== after) {
    instance[method] = function() {
      before.apply(instance, arguments)
      return after.apply(instance, arguments)
    }
  }
}

export function shallowDiffers(a, b) {
  for (let key in a) if (a[key] !== b[key]) return true
  for (let key in b) if (!(key in a)) return true
  return false
}

const cache = {
  start: 'onStart',
  next: 'onNext',
  complete: 'onComplete',
  error: 'onError',
  cancel: 'onCancel'
}

export function toCallbackName(status) {
  return cache[status]
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [].concat(value)
}
