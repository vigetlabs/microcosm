/**
 * CopyIf
 * Copy wanted keys from an object
 */

export default function (object, predicate) {
  let copy = {}

  for (var i in object) {
    if (predicate(object[i])) {
      copy[i] = object[i]
    }
  }

  return copy
}
