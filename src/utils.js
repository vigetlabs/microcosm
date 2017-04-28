/**
 * @flow
 */

import type Microcosm from './microcosm'
import { castPath, type KeyPath } from './key-path'

const $Symbol = typeof Symbol === 'function' ? Symbol : {}
const toStringTagSymbol = $Symbol.toStringTag || '@@toStringTag'

/**
 * Shallow copy an object
 */
export function clone(target: any) {
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
export function merge() {
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
 * Retrieve a value from an object. If no key is provided, just return the
 * object.
 */
export function get(object: ?Object, key: KeyPath | string, fallback?: any) {
  if (object == null) {
    return fallback
  }

  let path = castPath(key)

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
 * Non-destructively assign a value to a provided object at a given key. If the
 * value is the same, don't do anything. Otherwise return a new object.
 */
export function set(object: ?Object, key: KeyPath | string, value: any) {
  // Ensure we're working with a key path, like: ['a', 'b', 'c']
  let path = castPath(key)

  let len = path.length

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
 */
export function isPromise(obj: any): boolean {
  return (isObject(obj) || isFunction(obj)) && isFunction(obj.then)
}

/**
 * Is a value an object?
 */
export function isObject(target: any): boolean {
  return !!target && typeof target === 'object'
}

/**
 * Is a value a function?
 */
export function isFunction(target: any): boolean {
  return !!target && typeof target === 'function'
}

/**
 * Is a value a string?
 */
export function isString(target: any): boolean {
  return typeof target === 'string'
}

/**
 * Is the provided value a generator function? This is largely
 * informed by the regenerator runtime.
 */
export function isGeneratorFn(value: any): boolean {
  return get(value, toStringTagSymbol, '') === 'GeneratorFunction'
}

export function createOrClone(
  target: Object | Function,
  options: Object,
  repo: Microcosm
) {
  if (typeof target === 'function') {
    return new target(options, repo)
  }

  return Object.create(target)
}

/**
 * A helper combination of get and set.
 */
export function update(
  state: ?Object,
  key: KeyPath | string,
  updater: any,
  fallback: ?any
) {
  let path = castPath(key)

  if (isFunction(updater) === false) {
    return set(state, path, updater)
  }

  let last = get(state, path, fallback)
  let next = updater(last)

  return set(state, path, next)
}
