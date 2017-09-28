/**
 * Execute a GraphQL Query
 * Note: This does not handle mutations. Queries only
 */

import { get } from 'microcosm'
import { parseArguments } from './arguments'
import { assign } from './utilities'
import { createFinder } from './default-resolvers'
import { ROOT_QUERY, TYPE_NAME } from './constants'

const noop = n => n

const $Symbol = typeof Symbol === 'function' ? Symbol : {}

export const toStringTag: * = get($Symbol, 'toStringTag', '@@toStringTag')

export function getStringTag(value: any): string {
  if (!value) {
    return ''
  }

  return value[toStringTag] || ''
}

function isGeneratorFn(value) {
  return getStringTag(value) === 'GeneratorFunction'
}

class RecordLink {
  constructor(entry, field, resolver) {
    this.key = entry.name.value
    this.args = entry.arguments
    this.field = field
    this.resolver = resolver
    this.upstream = {}
    this.downstream = {}
  }

  resolve(root, context) {
    let args = parseArguments(this.args, context.variables)

    return this.resolver(root, args, context.state[this.field.type])
  }

  push(root, context) {
    let answer = this.resolve(root, context)

    if (isGeneratorFn(this.resolver)) {
      for (var value of answer) {
        this.trickle(value, context)
      }
    } else {
      this.trickle(answer, context)
    }
  }

  bubble(key, result) {
    for (var id in this.upstream) {
      this.upstream[id].bubble(key, result)
    }
  }

  trickle(root, context) {
    let result = {}
    for (var key in this.downstream) {
      result[key] = this.downstream[key].push(root, context)
    }

    this.bubble(this.key, result)
  }

  subscribe(link) {
    this.upstream[link.key] = link
  }

  pipe(link) {
    this.downstream[link.key] = link
  }
}

class Leaf extends RecordLink {
  push(root, context) {
    let answer = this.resolve(root, context)

    if (isGeneratorFn(this.resolver)) {
      let next = answer.next()

      if (!next.done) {
        this.bubble(this.key, next.value)

        let loop = () => {
          let next = answer.next()

          if (!next.done) {
            this.bubble(this.key, next.value)
            setTimeout(loop)
          }
        }

        setTimeout(loop)
      }
    } else {
      this.bubble(this.key, value)
    }
  }
}

class CollectionLink extends RecordLink {
  push(root, context) {
    let answer = this.resolve(root, context)

    if (isGeneratorFn(this.resolver)) {
      for (var value of answer) {
        let next = []
        for (var i = 0, len = value.length; i < len; i++) {
          next[i] = this.trickle(value[i], context)
        }
      }
    } else {
      let next = []
      for (var i = 0, len = answer.length; i < len; i++) {
        next[i] = this.trickle(answer[i], context)
      }
    }

    return next
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

  if (parent) {
    parent.pipe(link)
    link.subscribe(parent)
  }

  for (var i = 0; i < selections.length; i++) {
    scan(selections[i], schema, resolvers, schema[field.type], link)
  }

  return link
}

export function compile(repo, schema, entry, resolvers) {
  let top = {
    key: 'top',
    bubble: function(key, value) {
      console.log('Change!', key, value)
    }
  }

  let work = entry.selectionSet.selections.map(selection => {
    let link = scan(selection, schema, resolvers, schema.Query, null)

    link.subscribe(top)

    return link
  })

  return function(state, context) {
    return work.map(link => link.push(state, context))
  }
}

export function execute(repo, work, cache, state, variables) {
  let context = { repo, variables, state, cache }
  let answer = {}

  for (var i = 0, len = work.length; i < len; i++) {
    answer[work[i].name] = resolve(state, work[i], context)
  }

  return answer
}
