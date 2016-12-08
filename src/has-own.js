/**
 * A more resilient way to check for membership. A user may have an
 * object without a prototype, through Object.create(null).
 *
 * @example
 * let membership = hasOwn.call(obj, 'key')
 */
export default Object.prototype.hasOwnProperty
