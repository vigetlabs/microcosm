/**
 * Execute a GraphQL Query
 * Note: This does not handle mutations. Queries only
 */

import { get } from 'microcosm'
import { parseArguments } from './arguments'
import { assign } from './utilities'
import { createFinder } from './default-resolvers'
import { ROOT_QUERY } from './constants'

const noop = n => n

const identifiedBy = (definition, args, name, object) => {
  let id = definition.name === ROOT_QUERY ? '' : ':' + object.id
  let params = '('

  for (var key in args) {
    params += `${key}:${args[key]}`
  }

  params += ')'

  // Planet:1234
  return definition.name + '.' + name + params + id
}

function getResolver(resolvers, definition, field, key) {
  let resource = definition.name

  if (key === '__typename') {
    return () => resource
  }

  let resolver = get(resolvers, [resource, key, 'resolver'], null)

  return resolver || createFinder(definition, field)
}

function scan(entry, schema, resolvers, definition) {
  const name = entry.name.value
  const key = entry.alias ? entry.alias.value : name
  const field = definition.fields[name]

  let selections = get(entry, ['selectionSet', 'selections'], [])
  let resolver = getResolver(resolvers, definition, field, name)
  let setup = get(resolvers, [definition.name, name, 'setup'])
  let didSetup = !setup
  let isLeaf = selections.length <= 0

  return {
    name: key,
    arguments: entry.arguments,
    isLeaf: isLeaf,
    setup: function(root, repo, args) {
      if (didSetup === false) {
        didSetup = true
        setup(repo, args)
      }
    },
    resolve: function(root, args, context) {
      if (name === '__typename') {
        return resolver(root, args, context.state)
      }

      var related = context.state[field.type]
      let key = identifiedBy(definition, args, name, root)
      let cache = context.cache[key]

      if (cache && cache.root === root && cache.related === related) {
        return cache.answer
      }

      let answer = resolver(root, args, context.state)

      context.cache[key] = {
        root,
        answer,
        related
      }

      return answer
    },
    selections: selections.map(selection => {
      return scan(selection, schema, resolvers, schema[field.type])
    })
  }
}

function select(selections, item, context) {
  let len = selections.length
  let copy = item

  while (len--) {
    var selection = selections[len]
    var value = resolve(copy, selection, context)

    copy = assign(copy, selection.name, value, item)
  }

  return copy
}

function selectAll(selections, list, context) {
  let len = list.length
  let copy = list

  while (len--) {
    let item = list[len]
    let value = select(selections, item, context)

    copy = assign(copy, len, value, list)
  }

  return copy
}

function resolve(root, entry, context) {
  let args = parseArguments(entry.arguments, context.variables)

  entry.setup(root, context.repo, args)

  let answer = entry.resolve(root, args, context)

  if (answer == null || entry.isLeaf) {
    // Do nothing
  } else if (Array.isArray(answer)) {
    answer = selectAll(entry.selections, answer, context)
  } else {
    answer = select(entry.selections, answer, context)
  }

  return answer
}

export function compile(repo, schema, entry, resolvers) {
  let work = entry.selectionSet.selections.map(selection =>
    scan(selection, schema, resolvers, schema.Query)
  )

  return execute.bind(null, repo, work, {})
}

export function execute(repo, work, cache, state, variables) {
  let context = { repo, variables, state, cache }
  let answer = {}

  for (var i = 0, len = work.length; i < len; i++) {
    answer[work[i].name] = resolve(state, work[i], context)
  }

  return answer
}
