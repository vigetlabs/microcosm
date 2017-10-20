/**
 * Execute a GraphQL Query
 * Note: This does not handle mutations. Queries only
 */

import { get, set } from 'microcosm'
import { parseArguments } from './arguments'
import { hashcode, generateKey } from './hash'
import { createFinder } from './default-resolvers'
import { getName } from './utilities'
import { ROOT_QUERY } from './constants'

const identity = n => n

function zipObject(keys, values) {
  let obj = {}

  for (var i = 0; i < keys.length; i++) {
    obj[keys[i]] = values[i]
  }

  return obj
}

class Link {
  constructor(entry, type, resolver) {
    this.key = getName(entry)
    this.args = entry.arguments
    this.type = type
    this.resolver = resolver
    this.downstream = {}
  }

  parameterize(context) {
    return parseArguments(this.args, context.variables)
  }

  toHash(root, context, cache) {
    return [
      generateKey(this.resolver, cache.pool),
      generateKey(root, cache.pool),
      hashcode(context.variables, cache.pool)
    ].join('/')
  }

  resolve(root, context, cache) {
    let code = this.toHash(root, context, cache)

    if (code in cache.answers) {
      return cache.answers[code]
    }

    let args = this.parameterize(context)
    let pool = context.state[this.type]
    let raw = this.resolver(root, args, pool)

    cache.answers[code] = Promise.resolve(raw)

    return cache.answers[code]
  }

  push(root, context, cache) {
    throw new Error('Implement push.')
  }

  trickle(root, context, cache) {
    let keys = []
    let result = []

    for (var key in this.downstream) {
      keys.push(key)
      result.push(this.downstream[key].push(root, context, cache))
    }

    return Promise.all(result).then(values => zipObject(keys, values))
  }

  pipe(link) {
    this.downstream[link.key] = link
  }
}

class LeafLink extends Link {
  push(root, context, cache) {
    return this.resolve(root, context, cache)
  }
}

class RecordLink extends Link {
  push(root, context, cache) {
    return this.resolve(root, context, cache).then(value =>
      this.trickle(value, context, cache)
    )
  }
}

class CollectionLink extends Link {
  push(root, context, cache) {
    return this.resolve(root, context, cache).then(value => {
      return Promise.all(value.map(i => this.trickle(i, context, cache)))
    })
  }
}

class RootLink extends Link {
  constructor() {
    super({ name: { value: 'Root' } }, {}, identity)
  }

  push(root, context, cache) {
    return this.trickle(root, context, cache)
  }
}

function linkForField(field, selections) {
  if (field.isList) {
    return CollectionLink
  }

  return selections.length ? RecordLink : LeafLink
}

function scan(entry, schema, resolvers, definition, parent) {
  const name = entry.name.value
  const field = definition.fields[name]

  const resolver = get(
    resolvers,
    [definition.name, field.name],
    createFinder(schema, definition, field)
  )

  const selections = get(entry, ['selectionSet', 'selections'], [])
  const LinkType = linkForField(field, selections)
  const link = new LinkType(entry, field.type, resolver)

  selections.forEach(selection => {
    scan(selection, schema, resolvers, schema[field.type], link)
  })

  parent.pipe(link)

  return link
}

export function compile(repo, schema, entry, resolvers) {
  let top = new RootLink(entry)
  let cache = { pool: new Map(), answers: {} }

  entry.selectionSet.selections.forEach(selection => {
    scan(selection, schema, resolvers, schema.Query, top)
  })

  return (state, context) => {
    return top.push(state, context, cache)
  }
}
