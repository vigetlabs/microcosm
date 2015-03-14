/**
 * PromiseWrap
 * Makes sure a given value is always a promise
 */

export default value => {
  if (value instanceof Promise) {
    return value
  } else {
    return Promise.resolve(value)
  }
}
