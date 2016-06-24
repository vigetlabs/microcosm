/**
 * Retrieve a value from an object. If no key is provided, just
 * return the object.
 *
 * @example
 *     get({ foo: 'bar' }, 'foo') // 'bar'
 *     get({ foo: 'bar' }, undefined) // { foo: 'bar' }
 *
 * @api private
 *
 * @param {Object} object - The target object
 * @param {String} key - The key to access
 *
 * @returns {Any} A retrieved value
 */
export function get (object, key) {
  return key == null ? object : object[key]
}

/**
 * Immutabily assign a value to a provided object at a given key. If
 * the value is the same, don't do anything. Otherwise return a new
 * object.
 *
 * @example
 *     set({ foo: 'bar' }, 'baz', 'bip') // { foo: 'bar', baz: 'bip' }
 *
 * @api private
 *
 * @param {Object} object - The target object
 * @param {String} key - The key to set
 * @param {Any} value - The value to assign
 *
 * @returns {Any} A copy of the object with the new assignment.
 */
export function set (object, key, value) {
  if (typeof value === 'undefined') {
    return object
  }

  if (key == null) return value

  if (object && object[key] === value) {
    return object
  }

  return Object.assign({}, object, { [key] : value })
}
