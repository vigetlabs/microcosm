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
      if (copy[key] !== next[key]) {
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
  if (Array.isArray(key)) {
    return getIn(object, key)
  }

  return key == null ? object : object[key]
}

/**
 * Retrieve a value deeply within an object given an array of sequential
 * keys.
 */
export function getIn (object, keys) {
  let key = keys[0]
  let rest = keys.slice(1)

  let isDeep = get(object, key) && rest.length > 0
  return isDeep ? getIn(object[key], rest) : get(object, key)
}

/**
 * Immutabily assign a value to a provided object at a given key. If
 * the value is the same, don't do anything. Otherwise return a new
 * object.
 */
export function set (object, key, value) {
  if (Array.isArray(key)) {
    return setIn(object, key, value)
  }

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

/**
 * Deeply assign a value given a path of sequential keys.
 */
export function setIn (object, keys, value) {
  if (getIn(object, keys) === value) {
    return object
  }

  let key = keys[0]
  let rest = keys.slice(1)
  let copy = clone(object)

  if (rest.length) {
    copy[key] = (key in copy) ? setIn(copy[key], rest, value) : setIn({}, rest, value)
  } else {
    copy[key] = value
  }

  return copy
}

/**
 * Compile a key path list for indexes
 */
export function compileKeyPaths (string) {
  let items = string.split(/\s*\,\s*/g)

  return items.map(q => q.split(/\./g))
}

/**
 * Given a query (see above), return a subset of an object.
 */
export function extract (object, keyPaths, seed) {
  return keyPaths.reduce(function (memo, keyPath) {
    return set(memo, keyPath, get(object, keyPath))
  }, seed || {})
}
