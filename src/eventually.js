module.exports = function eventually (fn, scope, error, payload) {
  if (fn == null) return null

  /**
   * This is a neat trick to get around the promise try/catch:
   * https://github.com/then/promise/blob/master/src/done.js
   *
   * Note: Referencing setTimeout from global allows for higher
   * v8 optimization.
   */
  return global.setTimeout(fn.bind(scope, error, payload))
}
