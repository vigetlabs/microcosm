import { get, update, merge } from 'microcosm'
import { ROOT_QUERY, OBJECT_DEF } from './constants'
import { filter, getName, getType, reduceName } from './utilities'
import { isSingular } from './directives'

export function makeType(definition, key) {
  return {
    name: key,
    root: key === ROOT_QUERY,
    isSingular: isSingular(definition),
    fields: reduceName(definition.fields, (field, name) => {
      return {
        name: name,
        type: getType(field),
        isList: field.type.kind === 'ListType'
      }
    })
  }
}

export function getQueries(document) {
  let typeDefs = filter(document.definitions, { kind: OBJECT_DEF })

  return reduceName(typeDefs, makeType)
}

export function getMutations(schema) {
  let fields = get(schema, 'Mutation.fields', {})

  return Object.keys(fields).reduce((memo, next) => {
    let [operation, resource] = next.split(/([A-Z].+$)/, 2)

    return update(
      memo,
      resource,
      list => list.concat(merge(fields[next], { operation, resource })),
      []
    )
  }, {})
}
