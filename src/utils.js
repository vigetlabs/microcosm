/**
 * @flow
 */

import type Microcosm from './microcosm'
import { castPath, type KeyPath } from './key-path'

/**
 * Generate a unique id
 * @private
 */
let uidStepper = 0
export function uid(prefix: string): string {
  return `${prefix}${uidStepper++}`
}

/**
 * Shallow copy an object
 * @private
 */
export function clone(target: ?Object): Object {
  if (Array.isArray(target)) {
    return target.slice(0)
  } else if (isObject(target) === false) {
    return {}
  }

  let copy = {}

  for (var key in target) {
    copy[key] = target[key]
  }

  return copy
}

/**
 * Merge any number of objects into a provided object.
 * @private
 */
export function merge(): Object {
  var copy = {}
  var first = copy
  var dirty = false

  for (var i = arguments.length - 1; i >= 0; i--) {
    var subject = arguments[i]

    if (isObject(subject) === false) {
      continue
    }

    if (first === copy) {
      first = subject
    }

    for (var key in subject) {
      if (!dirty) {
        dirty = key in first === false
      }

      if (key in copy === false) {
        copy[key] = subject[key]
      }
    }
  }

  return dirty ? copy : first
}

/**
 * Retrieve a value from an object. If no key is provided, just return the
 * object.
 * @private
 */
export function get(object: ?Object, keyPath: string | KeyPath, fallback?: *) {
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
 * Non-destructively assign a value to a provided object at a given key. If the
 * value is the same, don't do anything. Otherwise return a new object.
 * @private
 */
export function set(object: Object, key: string | KeyPath, value: *): Object {
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
 * @param {*} obj
 * @return {boolean}
 * @private
 */
export function isPromise(obj: *): boolean {
  return (isObject(obj) || isFunction(obj)) && isFunction(obj.then)
}

/**
 * Is a value an object?
 * @param {*} target
 * @return {boolean}
 * @private
 */
export function isObject(target: *): boolean {
  return !(!target || typeof target !== 'object')
}

/**
 * Is a value a function?
 * @param {*} target
 * @return {boolean}
 * @private
 */
export function isFunction(target: *): boolean {
  return !!target && typeof target === 'function'
}

/**
 * Is a value a string?
 * @param {*} target
 * @return {boolean}
 * @private
 */
export function isString(target: *): boolean {
  return typeof target === 'string'
}

/**
 * Get the toStringTag symbol out of an object, with
 * some legacy support.
 * @param {*} value
 * @return {string}
 */
const $Symbol = typeof Symbol === 'function' ? Symbol : {}
const toStringTagSymbol = $Symbol.toStringTag || '@@toStringTag'
export function toStringTag(value: *): string {
  if (!value) {
    return ''
  }

  return value[toStringTagSymbol] || ''
}

/**
 * Is the provided value a generator function? This is largely
 * informed by the regenerator runtime.
 * @param {*} value
 * @return {boolean}
 * @private
 */
export function isGeneratorFn(value: *): boolean {
  return toStringTag(value) === 'GeneratorFunction'
}

/**
 * @private
 */
export function createOrClone(target: *, options: ?Object, repo: Microcosm) {
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
 * @private
 */
export function update(
  state: *,
  keyPath: string | KeyPath,
  updater: *,
  fallback?: *
) {
  let path = castPath(keyPath)

  if (isFunction(updater) === false) {
    return set(state, path, updater)
  }

  let last = get(state, path, fallback)
  let next = updater(last)

  return set(state, path, next)
}
