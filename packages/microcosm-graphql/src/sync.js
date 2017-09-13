/**
 * Sync - Microcosm GraphQL provides default implementations of mutations.
 */

import { spawner, passThrough, append, remove, update } from './mutations'

const tokenize = string => string.split(/([A-Z].+$)/)

export function sync(mutation) {
  let [method, resource] = tokenize(mutation)

  switch (method) {
    case 'add':
      return { action: spawner(mutation, resource), handler: append }
    case 'create':
      // TODO: This should POST
      return { action: spawner(mutation, resource), handler: append }
    case 'remove':
      return { action: passThrough(mutation), handler: remove }
    case 'delete':
      // TODO: This should DELETE
      return { action: passThrough(mutation, resource), handler: remove }
    case 'update':
      return { action: passThrough(mutation), handler: update }
    case 'patch':
      // TODO: This should PATCH
      return { action: passThrough(mutation, resource), handler: update }
    default:
      return { action: passThrough(mutation, resource), handler: null }
  }
}
