// @flow

import { EMPTY_ARRAY } from './empty'
import { Subject } from './subject'

type KeyPath = Array<string>
type MixedObject = { [key: string]: mixed }

function castPath(value: string | KeyPath): KeyPath {
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

function isObject(value: *) {
  return value !== null && typeof value === 'object'
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

  if (typeof updater !== 'function') {
    return set(state, path, updater)
  }

  let last = get(state, path, fallback)
  let next = updater(last)

  return set(state, path, next)
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
 * Shallow copy an object
 */
export function clone<T: MixedObject>(target: T): $Shape<T> {
  if (Array.isArray(target)) {
    return target.slice(0)
  } else if (isObject(target) === false) {
    return {}
  }

  let copy = {}

  for (let key in target) {
    copy[key] = target[key]
  }

  return copy
}

// TODO: This should be generic:
//   class Tree<Node>
// However Flow is having a hard time following the provided signature :-/
export class Tree {
  _backwards: Map<Subject, Subject>
  _forwards: Map<Subject, Subject>

  constructor() {
    this._backwards = new Map()
    this._forwards = new Map()
  }

  point(before: Subject, after: Subject) {
    this._backwards.set(after, before)
    this._forwards.set(before, after)
  }

  before(node: Subject): ?Subject {
    return this._backwards.has(node) ? this._backwards.get(node) : null
  }

  after(node: Subject): ?Subject {
    return this._forwards.has(node) ? this._forwards.get(node) : null
  }

  remove(node: Subject): ?Subject {
    let before = this._backwards.get(node)
    let after = this._forwards.get(node)

    this._forwards.delete(node)
    this._backwards.delete(node)

    if (before && after) {
      if (this._forwards.get(before) === node) {
        this._forwards.set(before, after)
      }
      if (this._backwards.get(after) === node) {
        this._backwards.set(after, before)
      }
    }

    return after || before
  }

  select(node: Subject): Subject[] {
    let path = []

    while (node) {
      var before = this.before(node)

      path.push(node)

      if (before) {
        this.point(before, node)
        node = before
      } else {
        break
      }
    }

    return path.reverse()
  }

  toJS(node: ?Subject): ?Object {
    if (node) {
      let base = node.toJSON()

      base.children = this._children(node).map(this.toJS, this)

      return base
    }

    return null
  }

  // Private -------------------------------------------------- //

  _children(node: Subject): Subject[] {
    let all: Array<Subject> = Array.from(this._backwards.keys())

    return all.filter(child => this._backwards.get(child) === node)
  }
}
