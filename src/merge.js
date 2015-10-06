/**
 * A simpler object merge. Object.assign addresses some use cases
 * we do not need, such as membership and the ability to merge
 * more than one object.
 */

import assert from 'assert'

module.exports = function (a, b) {
  assert(a.constructor === Object, 'expected simple object. Instead got ' + a.constructor.name)
  assert(b.constructor === Object, 'expected simple object. Instead got ' + b.constructor.name)

  for (var key in b) {
    a[key] = b[key]
  }

  return a
}
