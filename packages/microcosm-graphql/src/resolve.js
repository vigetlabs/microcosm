import { parseArguments } from './arguments'
import { getName } from './utilities'

export function select(state, schema, entry, context, type) {
  if (!entry.selectionSet) {
    return state
  }

  return entry.selectionSet.selections.reduce(function(result, entry) {
    let field = getName(entry)

    result[field] = resolve(state, schema, entry, context, type, field)

    return result
  }, {})
}

export function resolve(state, schema, entry, context, type, field) {
  let resolver = context.resolvers[type][field]

  let args = parseArguments(entry.arguments, context.variables)
  let value = resolver(state, args)
  let nextType = schema.returnType(type, field)

  if (Array.isArray(value)) {
    return value.map(item => select(item, schema, entry, context, nextType))
  }

  return select(value, schema, entry, context, nextType)
}
