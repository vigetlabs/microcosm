/**
 * @fileoverview A key path is a list of property names that describe
 * a pathway through a nested javascript object. For example,
 * `['users', 2]` could represent a path within in `{ users: [{id: 0},
 * {id: 1}] }`
 * @flow
 */

import { isBlank } from './utils'

export type KeyPath = Array<string>

const KEY_DELIMETER = '.'
const PATH_DELIMETER = ','
const EMPTY = []

function clean(value: string | number | boolean) {
  console.assert(value != null, 'keyPath should never be null.')
  console.assert(
    value !== null && typeof value !== 'object',
    'keyPath should never be an object or array. Given:',
    value
  )

  return value.toString().trim()
}

/**
 * Ensure a value is a valid key path.
 * @private
 */
export function castPath(value: string | KeyPath): KeyPath {
  if (Array.isArray(value)) {
    return value
  }

  if (isBlank(value)) {
    return EMPTY
  }

  return clean(value).split(KEY_DELIMETER)
}

/**
 * Convert a value into a list of key paths. These paths may be comma
 * separated, which is used in the CompareTree to describe a
 * subscription to multiple pathways in an object.
 * @private
 */
export function getKeyPaths(value: *): Array<KeyPath> {
  return clean(value)
    .split(PATH_DELIMETER)
    .map(castPath)
}

/**
 * Convert a key path into a string.
 * @private
 */
export function getKeyString(value: KeyPath): string {
  return value.join(KEY_DELIMETER)
}

/**
 * Convert a list of keys path into a string.
 * @private
 */
export function getKeyStrings(array: Array<KeyPath>): string {
  return array.map(getKeyString).join(PATH_DELIMETER)
}
