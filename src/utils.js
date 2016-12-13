/**
 * A more resilient way to check for membership. A user may have an
 * object without a prototype, through Object.create(null).
 *
 * @example
 * let membership = hasOwn.call(obj, 'key')
 */
export const hasOwn = Object.prototype.hasOwnProperty

/**
 * Shallow copy an object
 */
export function clone (a) {
  let copy = {}

  for (var key in a) {
    if (hasOwn.call(a, key)) {
      copy[key] = a[key]
    }
  }

  return copy
}

/**
 * Merge any number of objects into a provided object.
 */
export function merge (subject) {
  let copy = subject

  for (var i = 1, len = arguments.length; i < len; i++) {
    var next = arguments[i]

    for (var key in next) {
      if (hasOwn.call(next, key) && copy[key] !== next[key]) {
        if (copy === subject) {
          copy = clone(subject)
        }

        copy[key] = next[key]
      }
    }
  }

  return copy
}

/**
 * Standard shallow equals check
 */
export function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true
  }

  if ((objA && !objB) || (!objA && objB)) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false
    }
  }

  return true
}

/**
 * Basic prototypal inheritence
 */
export function inherit (Child, Ancestor, proto) {
  Child.__proto__ = Ancestor

  Child.prototype = Object.create(Ancestor.prototype)

  Child.prototype.constructor = Child

  for (var key in proto) {
    if (hasOwn.call(proto, key)) {
      Child.prototype[key] = proto[key]
    }
  }
}

/**
 * Retrieve a value from an object. If no key is provided, just
 * return the object.
 */
export function get (object, key) {
  return key == null ? object : object[key]
}

/**
 * Immutabily assign a value to a provided object at a given key. If
 * the value is the same, don't do anything. Otherwise return a new
 * object.
 */
export function set (object, key, value) {
  // If the key path is null, there's no need to traverse the
  // object. Just return the value.
  if (key == null) {
    return value
  }

  if (value === undefined || get(object, key) === value) {
    return object
  }

  let copy = clone(object)

  copy[key] = value

  return copy
}
