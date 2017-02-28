const EMPTY_ARRAY = []

export function castPath (value) {
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
export function clone (target) {
  if (Array.isArray(target)) {
    return target.slice(0)
  } else if (isObject(target) === false) {
    return target
  }

  let copy = {}

  for (var key in target) {
    copy[key] = target[key]
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
 * Retrieve a value from an object. If no key is provided, just return the
 * object.
 */
export function get (object, path, fallback) {
  if (object == null) {
    return fallback
  }

  path = castPath(path)

  for (var i = 0, len = path.length; i < len; i++) {
    let value = object == null ? undefined : object[path[i]]

    if (value === undefined) {
      i = len
      value = fallback
    }

    object = value
  }

  return object
}

/**
 * Non-destructively assign a value to a provided object at a given key. If the
 * value is the same, don't do anything. Otherwise return a new object.
 */
export function set (object, path, value) {
  // Ensure we're working with a key path, like: ['a', 'b', 'c']
  path = castPath(path)

  let len  = path.length

  if (len <= 0) {
    return value
  }

  if (get(object, path) === value) {
    return object
  }

  let root = clone(object)
  let node = root

  // For each key in the path...
  for (var i = 0; i < len; i++) {
    let key = path[i]
    let next = value

    // Are we at the end?
    if (i < len - 1) {
      // No: Check to see if the key is already assigned,
      if (key in node) {
        // If yes, clone that value
        next = clone(node[key])
      } else {
        // Otherwise assign an object so that we can keep drilling down
        next = {}
      }
    }

    // Assign the value, then continue on to the next iteration of the loop
    // using the next step down
    node[key] = next
    node = node[key]
  }

  return root
}

export function isPromise(obj) {
  let type = typeof obj
  return !!obj && (type === 'object' || type === 'function') && typeof obj.then === 'function'
}

export function isObject (target) {
  return !!target && typeof target === 'object'
}

export function createOrClone (target, options, repo) {
  if (typeof target === 'function') {
    return new target(options, repo)
  }

  return Object.create(target)
}

/**
 * A helper combination of get and set
 */
export function update (state, path, fn, fallback) {
  if (typeof fn !== 'function') {
    return set(state, path, fn)
  }

  let last = get(state, path, fallback)
  let next = fn(last)

  return set(state, path, next)
}
