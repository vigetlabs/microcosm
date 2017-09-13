import { get } from 'microcosm'
import { parseArguments } from './arguments'

function refine(schema, selectionSet, state, variables, resolvers, path) {
  let answer = {}

  for (var i = 0, len = selectionSet.selections.length; i < len; i++) {
    var selection = selectionSet.selections[i]
    var key = selection.alias ? selection.alias.value : selection.name.value

    answer[key] = extract(
      schema,
      selection,
      state,
      variables,
      resolvers,
      [].concat(path, key)
    )
  }

  return answer
}

function extract(schema, entry, state, variables, resolvers, path) {
  let { selectionSet, arguments: args } = entry

  let returnType = schema.structure(path)

  if (returnType == null) {
    throw new Error(
      `Attempted to pull "${path[1]}" out of ${path[0]}, but it is not defined in the schema!`
    )
  }

  let resolver = get(resolvers, path)
  let value = resolver(state, parseArguments(args, variables))

  if (!selectionSet) {
    if (!value && typeof value === 'object') {
      throw new Error(`No fields given for ${path.join('.')}.`)
    }

    return value
  }

  if (returnType.list) {
    return value.map(item => {
      return refine(
        schema,
        selectionSet,
        item,
        variables,
        resolvers,
        returnType.type
      )
    })
  }

  return refine(
    schema,
    selectionSet,
    value,
    variables,
    resolvers,
    returnType.type
  )
}

export default function resolve(schema, document, state, variables, resolvers) {
  let result = {}

  for (var i = 0; i < document.definitions.length; i++) {
    let { selectionSet } = document.definitions[i]

    let answer = refine(
      schema,
      selectionSet,
      state,
      variables,
      resolvers,
      'Query'
    )

    Object.assign(result, answer)
  }

  return result
}
