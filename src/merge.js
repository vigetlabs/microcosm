/**
 * A simpler object merge. Object.assign addresses some use cases
 * we do not need, such as direct membership and the ability to merge
 * more than one object.
 */

export default function merge (a, b) {
  if (b != null) {
    for (var key in b) {
      a[key] = b[key]
    }
  }

  return a
}
