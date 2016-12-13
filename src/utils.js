const hasOwn = Object.prototype.hasOwnProperty

/**
 * Shallow copy an object
 */
export function clone (a) {
  let copy = {}

  for (var key in a) {
    copy[key] = a[key]
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
 * Basic prototypal inheritence
 */
export function inherit (Child, Ancestor, proto) {
  Child.__proto__ = Ancestor

  Child.prototype = merge(Object.create(Ancestor.prototype), {
    constructor: Child
  }, proto)

  return Child
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
