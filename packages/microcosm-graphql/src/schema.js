import { get, update, merge } from 'microcosm'
import { ROOT_QUERY, OBJECT_DEF, LIST } from './constants'
import { filter, reduceName, getName } from './utilities'
import { isSingular } from './directives'

export function makeType(definition, name) {
  return {
    name: name,
    isSingular: isSingular(definition),
    fields: reduceName(definition.fields, (field, name) => {
      let isList = field.type.kind === LIST
      let type = isList ? getName(field.type.type) : getName(field.type)

      return { name, type, isList }
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
      list => {
        return list.concat(merge(fields[next], { operation, resource }))
      },
      []
    )
  }, {})
}
