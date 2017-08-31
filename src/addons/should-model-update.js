/**
 * Diffing algorithm for presenters. We need to recalculate the model
 * of props are state change, but ignore children.
 */

type Bindings = { [key: string]: * }

export default function shouldModelUpdate(a: Bindings, b: Bindings): boolean {
  for (let key in a) {
    if (key === 'children') {
      continue
    }

    if (a[key] !== b[key]) {
      return true
    }
  }

  for (let key in b) {
    if (!(key in a)) {
      return true
    }
  }

  return false
}
