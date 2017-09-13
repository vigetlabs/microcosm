import faker from 'faker'

function mockValue(name, type) {
  switch (type) {
    case 'ID':
      return faker.random.uuid()
    case 'String':
      switch (name) {
        case 'name':
          return faker.name.findName()
        case 'title':
          return faker.company.catchPhrase()
        case 'created':
        case 'updated':
          return faker.date.past().toISOString()
        default:
          return faker.lorem.sentence()
      }
    case 'Int':
      return Math.round(faker.random.number())
    case 'Float':
      return faker.random.number()
    case 'Boolean':
      return false
    default:
      return null
  }
}

export function generate(fields) {
  return fields.reduce(function(memo, field) {
    memo[field.name] = mockValue(field.name, field.type)
    return memo
  }, {})
}
