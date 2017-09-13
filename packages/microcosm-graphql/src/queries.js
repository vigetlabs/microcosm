/**
 * Queries
 * http://facebook.github.io/graphql/#sec-Language.Query-Document
 */

import { get } from 'microcosm'
import { values, find, filter } from './utilities'
import { badOneToMany } from './errors'

export function createFinder(repo, { singular, name, type, list }) {
  if (singular) {
    return _state => repo.state[type]
  }

  if (list) {
    return (_state, args) => filter(repo.state[type], args)
  }

  return (_state, args) => find(repo.state[type], args)
}

export function createRelationship(repo, schema, key, type, attribute) {
  if (type === 'Query') {
    return createFinder(repo, attribute, type)
  }

  let relation = find(values(get(schema.structure(attribute.type))), { type })

  if (!relation && attribute.list) {
    badOneToMany(key, type, attribute.type)
  }

  return (record, args) => {
    let pool = get(repo.state, attribute.type, [])

    if (attribute.list) {
      return filter(pool, { [relation.name]: record.id })
    } else {
      return find(pool, { id: record[key] })
    }
  }
}

export function createAccessor(key, fallback) {
  return state => get(state, key, fallback)
}
