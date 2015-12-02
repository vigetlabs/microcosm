export function isFunction (subject) {
  return typeof subject === 'function'
}

export function isGenerator (obj) {
  return !!obj && isFunction(obj.next) && isFunction(obj.throw)
}

export function isObject (obj) {
  return !!obj && typeof obj === 'object'
}

export function isPromise (obj) {
  return !!obj && (isObject(obj) || isFunction(obj)) && isFunction(obj.then)
}
