const EMPTY_ARRAY = []

function castPath (value) {
  if (Array.isArray(value)) {
    return value
  } else if (value == null) {
    return EMPTY_ARRAY
  }

  return typeof value === 'string' ? value.split('.') : [value]
}

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
export function get (object, path, fallback) {
  if (object == null) {
    return fallback
  }

  path = castPath(path)

  let index = -1
  let length = path.length

  while (++index < length) {
    let value = object == null ? undefined : object[path[index]]

    if (value === undefined) {
      index = length
      value = fallback
    }

    object = value
  }

  return object
}

/**
 * Immutabily assign a value to a provided object at a given key. If
 * the value is the same, don't do anything. Otherwise return a new
 * object.
 */
export function set (object, path, value) {
  if (value === undefined || get(object, path) === value) {
    return object
  }

  path = castPath(path)

  let length = path.length

  if (length <= 0) {
    return value
  } else if (length > 1) {
    return setIn(object, path, value)
  }

  let copy = clone(object)

  copy[path[0]] = value

  return copy
}

/**
 * Deeply assign a value given a path of sequential keys.
 */
export function setIn (object, keys, value) {
  if (get(object, keys) === value) {
    return object
  }

  let key = keys[0]
  let rest = keys.slice(1)
  let copy = clone(object)

  if (rest.length) {
    copy[key] = (key in copy) ? setIn(copy[key], rest, value) : setIn(Array.isArray(copy) ? [] : {}, rest, value)
  } else {
    copy[key] = value
  }

  return copy
}
