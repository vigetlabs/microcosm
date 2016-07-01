const hasOwn = Object.prototype.hasOwnProperty

function merge (a, b) {
  if (a == null || b == null) {
    return a
  }

  for (let key in b) {
    if (hasOwn.call(b, key)) {
      a[key] = b[key]
    }
  }

  return a
}

export default function (...values) {
  return values.reduce(merge)
}
