// @flow

import { EMPTY_OBJECT, EMPTY_ARRAY } from './empty'

type KeyList = Array<string>
type Path = string | KeyList

function pathToKeyList(value: Path): KeyList {
  if (Array.isArray(value)) {
    return value
  }

  if (value == undefined || value === '') {
    return EMPTY_ARRAY
  }

  return value
    .toString()
    .trim()
    .split('.')
}

function isObject(value: *): boolean {
  return value !== null && typeof value === 'object'
}

/**
 * A helper combination of get and set
 */
export function update(state: *, path: Path, updater: *, fallback?: *) {
  if (typeof updater !== 'function') {
    return set(state, path, updater)
  }

  let keyPath = pathToKeyList(path)
  let last = get(state, keyPath, fallback)

  return set(state, keyPath, updater(last))
}

/**
 * Non-destructively assign a value to a provided object at a given key. If the
 * value is the same, don't do anything. Otherwise return a new object.
 */
export function set(object: Object, path: Path, value: *): * {
  console.assert(
    path != null,
    `Expected path to be defined. Instead got ${String(path)}`
  )

  // Ensure we're working with a key path, like: ['a', 'b', 'c']
  let keyList = pathToKeyList(path)

  let len = keyList.length

  if (len <= 0) {
    return value
  }

  if (get(object, keyList) === value) {
    return object
  }

  let root = clone(object)
  let node = root

  // For each key in the path...
  for (var i = 0; i < len; i++) {
    let key = keyList[i]
    let next = value

    // Are we at the end?
    if (i < len - 1) {
      // No: Check to see if the key is already assigned,
      if (key in node) {
        // If yes, clone that value
        next = clone(node[key])
      } else {
        // Otherwise assign an object so that we can keep drilling down
        if (value == undefined) {
          break
        }
        next = {}
      }
    }

    // If the value is defined
    if (next !== undefined) {
      // Assign the value, then continue on to the next iteration of the loop
      // using the next step down
      node[key] = next
      node = node[key]
    } else {
      // Otherwise clear the value from the object
      delete node[key]
    }
  }

  return root
}

/**
 * Immutably remove a key from an object.
 */
export function remove(target: *, path: Path): * {
  return set(target, path, undefined)
}

/**
 * Retrieve a value from an object. If no key is provided, just return
 * the object.
 */
export function get(object: ?Object, path: Path, fallback?: *) {
  let keyList = pathToKeyList(path)
  let value = object

  for (var i = 0, len = keyList.length; i < len; i++) {
    if (value == null) {
      break
    }

    value = value[keyList[i]]
  }

  if (value === undefined || value === null) {
    return arguments.length <= 2 ? value : fallback
  }

  return value
}

/**
 * Merge any number of objects into a provided object.
 * $FlowFixMe This function enumerates on variable arguments
 */
export function merge(): Object {
  let cloned = false
  let copy = EMPTY_OBJECT

  for (var i = 0, len = arguments.length; i < len; i++) {
    var next = arguments[i]

    if (isObject(next) === false) {
      continue
    }

    if (copy === EMPTY_OBJECT) {
      copy = next || EMPTY_OBJECT
    }

    for (var key in next) {
      if (copy[key] !== next[key]) {
        if (cloned === false) {
          copy = clone(copy)
          cloned = true
        }

        copy[key] = next[key]
      }
    }
  }

  return copy
}

/**
 * Shallow copy an object
 */
export function clone<T: Object>(target: T): $Shape<T> {
  if (Array.isArray(target)) {
    return target.slice(0)
  }

  let copy = {}

  if (isObject(target)) {
    for (var key in target) {
      copy[key] = target[key]
    }
  }

  return copy
}
