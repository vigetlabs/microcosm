/**
 * shallowEquals
 * A dead simple shallow equality check.
 */

export default function (prev, next) {
  for (let i in prev) {
    if (prev[i] !== next[i]) return false
  }

  for (let i in next) {
    if (next[i] !== prev[i]) return false
  }

  return true
}
