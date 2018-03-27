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
  noSchema: string('Entity "%s" needs a schema.'),
  wrongType: string(
    'Entity "%s" expected a %s for key "%s". Instead found %s.'
  ),
  nullType: string(
    'Entity "%s" expected a %s for key "%s". Instead found null.'
  )
}
