/**
 * A simpler object merge. Object.assign addresses some use cases
 * we do not need, such as membership and the ability to merge
 * more than one object.
 */

import assert from 'assert'

export default function (a, b) {
  assert(a && a.constructor === Object, 'merge expected simple object as the first argument. Instead got ' + (a ? a.constructor.name : a))

  if (b) {
    assert(b.constructor === Object, 'merge expected simple object as the second argument. Instead got ' + (b ? b.constructor.name : b))

    for (var key in b) {
      a[key] = b[key]
    }
  }

  return a
}
