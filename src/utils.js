const hasOwn = Object.prototype.hasOwnProperty

/**
 * Shallow copy an object
 */
export function clone (a) {
  if (Array.isArray(a)) {
    return a.slice(0)
  }

  let copy = {}

  for (var key in a) {
    copy[key] = a[key]
  }

  return copy
}

/**
 * Merge any number of objects into a provided object.
 */
export function merge () {
  let copy = null
  let subject = null

  for (var i = 0, len = arguments.length; i < len; i++) {
    copy = copy || arguments[i]
    subject = subject || copy

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
export function get (object, key, fallback) {
  if (object == null) {
    return fallback
  } else if (key == null) {
    return object
  }

  if (Array.isArray(key)) {
    return getIn(object, key, fallback)
  }

  return hasOwn.call(object, key) ? object[key] : fallback
}

/**
 * Retrieve a value deeply within an object given an array of sequential
 * keys.
 */
export function getIn (object, keys, fallback) {
  let value = object

  for (var i = 0, len = keys.length; i < len; i++) {
    value = get(value, keys[i], fallback)
  }

  return value
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
function splitKeyPath (string) {
  return string.split(/\./)
}

export function compileKeyPaths (string) {
  let items = string.split(/\s*\,\s*/)

  return items.map(splitKeyPath)
}

/**
 * Given a query (see above), return a subset of an object.
 */
export function extract (object, keyPaths, seed) {
  return keyPaths.reduce(function (memo, keyPath) {
    return set(memo, keyPath, get(object, keyPath))
  }, seed || {})
}

/**
 * Squentially apply a list of functions to a value
 */
export function pipeline (state, processors, extra) {
  let next = state

  for (var i = 0, len = processors.length; i < len; i++) {
    next = processors[i](next, extra)
  }

  return next
}

export function toArray (list, offset) {
  let start = offset || 0
  let len = list.length
  let params = Array(len > start ? len - start : 0)

  for (var i = start; i < len; i++) {
    params[i - start] = list[i]
  }

  return params
}
