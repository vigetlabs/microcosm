/**
 * Execute a GraphQL Query
 * Note: This does not handle mutations. Queries only
 */

import { get, set } from 'microcosm'
import { parseArguments } from './arguments'
import { assign } from './utilities'
import { createFinder } from './default-resolvers'
import { ROOT_QUERY, TYPE_NAME } from './constants'

const noop = n => n

function zipObject(keys, values) {
  let obj = {}

  for (var i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i]
  }

  return obj
}

class RecordLink {
  constructor(entry, field, resolver) {
    this.key = entry.name ? entry.name.value : null
    this.args = entry.arguments || []
    this.field = field
    this.resolver = resolver
    this.downstream = {}
  }

  resolve(root, context) {
    let args = parseArguments(this.args, context.variables)
    let state = context.state[this.field.type]

    return Promise.resolve(this.resolver(root, args, state))
  }

  push(root, context) {
    return this.resolve(root, context).then(value =>
      this.trickle(value, context)
    )
  }

  trickle(root, context) {
    let keys = []
    let result = []

    for (var key in this.downstream) {
      keys.push(key)
      result.push(this.downstream[key].push(root, context))
    }

    return Promise.all(result).then(values => zipObject(keys, values))
  }

  pipe(link) {
    this.downstream[link.key] = link
  }
}

class RootLink extends RecordLink {
  push(root, context) {
    return this.trickle(root, context)
  }
}

class Leaf extends RecordLink {
  push(root, context) {
    return Promise.resolve(this.resolve(root, context))
  }
}

class CollectionLink extends RecordLink {
  push(root, context) {
    return this.resolve(root, context).then(value => {
      return Promise.all(value.map(i => this.trickle(i, context)))
    })
  }
}

function getResolver(resolvers, definition, field, key) {
  let resource = definition.name

  let resolver = get(resolvers, [resource, key, 'resolver'], null)

  return resolver || createFinder(definition, field)
}

function scan(entry, schema, resolvers, definition, parent) {
  const name = entry.name.value
  const field = definition.fields[name]

  let selections = get(entry, ['selectionSet', 'selections'], [])
  let resolver = getResolver(resolvers, definition, field, name)

  let LinkType = field.isList
    ? CollectionLink
    : selections.length ? RecordLink : Leaf

  let link = new LinkType(entry, field, resolver)

  for (var i = 0; i < selections.length; i++) {
    scan(selections[i], schema, resolvers, schema[field.type], link)
  }

  parent.pipe(link)

  return link
}

export function compile(repo, schema, entry, resolvers) {
  let top = new RootLink(entry)

  entry.selectionSet.selections.forEach(selection => {
    scan(selection, schema, resolvers, schema.Query, top)
  })

  return (state, context) => top.push(state, context)
}
