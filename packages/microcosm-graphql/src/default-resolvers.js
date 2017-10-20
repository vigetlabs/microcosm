/**
 * @flow
 */
import { find, filter } from './utilities'
import { ROOT_QUERY } from './constants'

export function createFinder(
  schema: Schema,
  definition: Definition,
  field: Field
) {
  const { name } = definition

  let isRoot = definition.name === ROOT_QUERY
  let attribute = isRoot ? field.type : field.name
  let related = schema[field.type]

  if (isRoot === false && related) {
    return createRelationship(related, field, attribute, definition.name)
  }

  return (state, args) => {
    let value = state[attribute]

    if (Array.isArray(value) === false) {
      return value
    }

    return field.isList ? filter(value, args) : find(value, args)
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

export function createRelationship(definition, field, attribute, type) {
  let relation = relatedField(definition, type)

  return (record, args, related) => {
    if (field.isList) {
      return filter(related, { [relation.name]: record.id })
    } else {
      return find(related, { id: record[attribute] })
    }
  }
}
