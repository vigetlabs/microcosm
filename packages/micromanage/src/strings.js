function string(content) {
  return (...values) => {
    return values.reduce((memo, value) => memo.replace('%s', value), content)
  }
}

export function nameOf(value) {
  switch (typeof value) {
    case 'function':
      return value.name
    default:
      return value ? value.constructor.name : String(value)
  }
}

export const errors = {
  noType: string('%s must define a type for property "%s".')
}
