/**
 * @flow
 */

import type Microcosm from './microcosm'
import { castPath, type KeyPath } from './key-path'
import { toStringTag } from './symbols'

type MixedObject = { [key: string]: mixed }

/**
 * Generate a unique id
 */
let uidStepper = 0
export function uid(prefix: string): string {
  return `${prefix}/${uidStepper++}`
}

/**
 * Shallow copy an object
 */
export function clone<T: MixedObject>(target: T): $Shape<T> {
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
 */
export function merge(...args: Array<?Object>): Object {
  let copy = null
  let subject = null

  for (var i = 0, len = args.length; i < len; i++) {
    if (isObject(args[i]) === false) {
      continue
    }

    copy = copy || args[i] || {}

    subject = subject || copy

    var next = args[i]
    for (var key in next) {
      if (copy[key] !== next[key]) {
        if (copy === subject) {
          copy = clone(subject)
        }

        copy[key] = next[key]
      }
    }
  }

  return copy || {}
}

/**
 * Retrieve a value from an object. If no key is provided, just return
 * the object.
 */
export function get(object: ?Object, keyPath: *, fallback?: *) {
  let path = castPath(keyPath)
  let value = object

  for (var i = 0, len = path.length; i < len; i++) {
    if (value == null) {
      break
    }

    value = value[path[i]]
  }

  if (value === undefined || value === null) {
    return arguments.length <= 2 ? value : fallback
  }

  return value
}

/**
 * Non-destructively assign a value to a provided object at a given key. If the
 * value is the same, don't do anything. Otherwise return a new object.
 */
export function set(object: Object, key: *, value: *): any {
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
export function isPromise(obj: *): boolean {
  return (isObject(obj) || isFunction(obj)) && isFunction(obj.then)
}

/**
 * Is a value an object?
 */
export function isObject(target: *): boolean {
  return !(!target || typeof target !== 'object')
}

/**
 * Is a value a function?
 */
export function isFunction(target: any): boolean {
  return !!target && typeof target === 'function'
}

export function isBlank(value: any): boolean {
  return value === '' || value === null || value === undefined
}

/**
 * Get the toStringTag symbol out of an object, with
 * some legacy support.
 */
/* istanbul ignore next */
export function getStringTag(value: any): string {
  if (!value) {
    return ''
  }

  return value[toStringTag] || ''
}

/**
 * Is the provided value a generator function? This is largely
 * informed by the regenerator runtime.
 */
export function isGeneratorFn(value: any): boolean {
  return getStringTag(value) === 'GeneratorFunction'
}

export function createOrClone(target: any, options: ?Object, repo: Microcosm) {
  if (isFunction(target)) {
    return new target(options, repo)
  }

  return Object.create(target)
}

/**
 * A helper combination of get and set
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

export function result(target: *, keyPath: string | KeyPath): * {
  let value = get(target, keyPath)

  if (typeof value === 'function') {
    return value.call(target)
  }

  return value
}
