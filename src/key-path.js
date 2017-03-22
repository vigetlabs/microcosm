/**
 * A key path is a list of property names that describe a pathway
 * through a nested javascript object. For example, `['users', 2]`
 * could represent a path within in `{ users: [{id: 0}, {id: 1}] }`
 */

const KEY_DELIMETER  = '.'
const PATH_DELIMETER = ','

function isBlank (value) {
  return value === '' || value === null || value === undefined
}

/**
 * Ensure a value is a valid key path.
 * @param {*} value Value to convert into a key path
 * @return {Array} List of keys, like ['users', 2]
 */
export function castPath (value) {
  if (Array.isArray(value)) {
    return value
  } else if (isBlank(value)) {
    return []
  }

  return typeof value === 'string' ? value.split(KEY_DELIMETER) : [value]
}

/**
 * Convert a value into a list of key paths. These paths may be comma
 * separated, which is used in the CompareTree to describe a
 * subscription to multiple pathways in an object.
 * @param {String|String[]} value Comma separated string or array
 * @return {Array} List of paths, like [['users'], ['query', 'focus']]
 */
export function getKeyPaths (value) {
  let paths = value

  if (Array.isArray(value) === false) {
    paths = `${paths}`.split(PATH_DELIMETER)
  }

  return paths.map(castPath)
}

/**
 * Convert a key path into a string.
 * @param {String[]} value List of keys, like ['query', 'focus']
 * @return {String} Dot separated string, like 'query.focus'
 */
export function getKeyString (value) {
  return value.join(KEY_DELIMETER)
}

/**
 * Convert a list of keys path into a string.
 * @param {Array} array List of key paths, like [['users'], ['query', 'focus']]
 * @return {Array} Comma key paths, like 'users,query.focus'
 */
export function getKeyStrings (array) {
  return array.map(getKeyString).join(PATH_DELIMETER)
}
