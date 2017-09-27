import { find, filter } from './utilities'
import { emptyArgs } from './arguments'
import { ROOT_QUERY } from './constants'

export function createFinder(definition, field) {
  let key = definition.name === ROOT_QUERY ? field.type : field.name
  let search = field.isList ? filter : find

  return (state, args) => {
    let value = state[key]

    if (Array.isArray(value) === false || emptyArgs(args)) {
      return value
    }

    return search(value, args)
  }
}

function relatedField(definition, type) {
  for (var key in definition.fields) {
    if (definition.fields[key].type === type) {
      return definition.fields[key]
    }
  }

  return null
}

export function createRelationship(definition, field, foreignKey, type) {
  let relation = relatedField(definition, type)

  console.assert(
    relation || field.isList === false,
    `${type}.${foreignKey}: Unable to resolve one-to-many resolver. Add a field to ${field.type} with a type of ${type}.`
  )

  return (record, args, state) => {
    let pool = state[field.type]

    console.assert(
      Array.isArray(record) === false,
      `${type}.${foreignKey}: Unable to resolve one-to-many resolver. ${field.type} is not an array.`
    )

    if (field.isList) {
      return filter(pool, { [relation.name]: record.id })
    } else {
      return find(pool, { id: record[foreignKey] })
    }
  }
}
