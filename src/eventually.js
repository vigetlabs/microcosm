import { isFunction } from './type-checks'

let eventually = function (fn, scope, error, payload) {
  if (!isFunction(fn)) {
    return undefined
  }

  /**
   * This is a neat trick to get around the promise try/catch:
   * https://github.com/then/promise/blob/master/src/done.js
   *
   * Note: Referencing setTimeout from global allows for higher
   * v8 optimization.
   *
   * Note: `fn.call` is intentionally used over `fn.bind`.
   * This is to respect functions where `bind` has already been
   * invoked (like `ReactComponent::setState`).
   */
  return global.setTimeout(() => fn.call(scope, error, payload))
}

export default eventually
