/**
 * A simpler object merge. Object.assign addresses some use cases
 * we do not need, such as membership and the ability to merge
 * more than one object.
 */

export default function (a, b) {
  if (b) {
    for (var key in b) {
      a[key] = b[key]
    }
  }

  return a
}
