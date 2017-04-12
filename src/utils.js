import {
  castPath
} from './key-path'

const hasOwn = Object.prototype.hasOwnProperty

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
    constructor: Child.prototype.constructor
  }, proto)

  return Child
}

/**
 * Retrieve a value from an object. If no key is provided, just return the
 * object.
 */
export function get (object, keyPath, fallback) {
  if (object == null) {
    return fallback
  }

  let path = castPath(keyPath)

  for (var i = 0, len = path.length; i < len; i++) {
    var value = object == null ? undefined : object[path[i]]

    if (value === undefined) {
      return fallback
    }

    object = value
  }

  return object
}

/**
 * Determine if a value is defined within an object
 */
export function has (object, key, fallback) {
  let path = castPath(key)

  for (var i = 0, len = path.length; i < len; i++) {
    var key = path[i]

    if (!object || hasOwn.call(object, key) === false) {
      return false
    }

    object = object[key]
  }

  return true
}

/**
 * Non-destructively assign a value to a provided object at a given key. If the
 * value is the same, don't do anything. Otherwise return a new object.
 */
export function set (object, key, value) {
  // Ensure we're working with a key path, like: ['a', 'b', 'c']
  let path = castPath(key)

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

/**
 * Is the provided object a promise?
 * @param {*} obj
 * @return {boolean}
 */
export function isPromise (obj) {
  return (isObject(obj) || isFunction(obj)) && isFunction(obj.then)
}

/**
 * Is a value an object?
 * @param {*} target
 * @return {boolean}
 */
export function isObject (target) {
  return !!target && typeof target === 'object'
}

/**
 * Is a value a function?
 * @param {*} target
 * @return {boolean}
 */
export function isFunction (target) {
  return !!target && typeof target === 'function'
}

/**
 * Is a value a string?
 * @param {*} target
 * @return {boolean}
 */
export function isString (target) {
  return typeof target === 'string'
}

/**
 * Is the provided value a generator function? This is largely
 * informed by the regenerator runtime.
 * @param {*} value
 * @return {boolean}
 */
var $Symbol = typeof Symbol === "function" ? Symbol : {};
var iteratorSymbol = $Symbol.iterator || "@@iterator";
var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
export function isGeneratorFn (value) {
  return get(value, toStringTagSymbol, '') === 'GeneratorFunction'
}

export function createOrClone (target, options, repo) {
  if (isFunction(target)) {
    return new target(options, repo)
  }

  return Object.create(target)
}

/**
 * A helper combination of get and set
 * @param {Object} state
 * @param {Array.<string>|string} keyPath
 * @param {*} updater A function or static value
 * @param {*} fallback value
 */
export function update (state, keyPath, updater, fallback) {
  let path = castPath(keyPath)

  if (isFunction(updater) === false) {
    return set(state, path, updater)
  }

  let last = get(state, path, fallback)
  let next = updater(last)

  return set(state, path, next)
}
