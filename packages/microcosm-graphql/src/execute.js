/**
 * Execute a GraphQL Query
 * Note: This does not handle mutations. Queries only
 */

import { Knowledge } from './knowledge'

export function compile(schema, entry, resolvers) {
  let knowledge = new Knowledge(schema, resolvers)

  knowledge.compile(entry)

  return context => knowledge.run(context)
}
